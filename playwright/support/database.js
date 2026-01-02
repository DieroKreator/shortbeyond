import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulid';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

async function insertTestUsers() {
    const client = await pool.connect();
    const plainPassword = 'pwd123';
    
    try {
        console.log('Iniciando inserção de 2000 usuários...');
        await client.query('BEGIN');

        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const users = [];
        const emailSet = new Set();

        // Gera usuários únicos
        while (users.length < 4000) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({
                firstName,
                lastName,
                provider: 'qtech.dev'
            }).toLowerCase();

            // Garante emails únicos
            if (!emailSet.has(email)) {
                emailSet.add(email);
                users.push({
                    id: ulid(),
                    email,
                    password: hashedPassword,
                    name: `${firstName} ${lastName}`,
                    plainPassword
                });
            }
        }

        // Inserção em lote otimizada
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);
            const values = [];
            const placeholders = [];
            
            batch.forEach((user, index) => {
                const offset = index * 4;
                placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
                values.push(user.id, user.email, user.password, user.name);
            });

            const query = `
                INSERT INTO users (id, email, password, name)
                VALUES ${placeholders.join(', ')}
                ON CONFLICT (email) DO NOTHING
            `;

            const result = await client.query(query, values);
            insertedCount += result.rowCount;
            
            // Progresso
            if ((i + batchSize) % 500 === 0 || i + batchSize >= users.length) {
                console.log(`Progresso: ${Math.min(i + batchSize, users.length)}/2000 usuários processados`);
            }
        }

        await client.query('COMMIT');
        console.log(`✓ ${insertedCount} usuários inseridos com sucesso!`);

        // Gera arquivo CSV
        await generateCSV(users);

        return { insertedCount, totalGenerated: users.length };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('✗ Erro ao inserir usuários:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

async function generateCSV(users) {
    try {
        const csvDir = path.resolve('data');
        
        // Cria diretório se não existir
        if (!fs.existsSync(csvDir)) {
            fs.mkdirSync(csvDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const csvPath = path.join(csvDir, `users-${timestamp}.csv`);

        // Cabeçalho CSV
        let csvContent = 'name,email,password\n';

        // Adiciona dados
        users.forEach(user => {
            const name = `"${user.name.replace(/"/g, '""')}"`;
            const email = user.email;
            const password = user.plainPassword;
            csvContent += `${name},${email},${password}\n`;
        });

        fs.writeFileSync(csvPath, csvContent, 'utf8');
        console.log(`✓ Arquivo CSV gerado: ${csvPath}`);
        
        return csvPath;
    } catch (err) {
        console.error('✗ Erro ao gerar CSV:', err.message);
        throw err;
    }
}

async function cleanupTestData() {
    const client = await pool.connect();
    try {
        console.log('Removendo usuários de teste...');
        await client.query('BEGIN');

        const query = `
            WITH usuarios_para_deletar AS (
                SELECT id FROM users WHERE email LIKE '%@qtech.dev'
            ),
            delete_links AS (
                DELETE FROM links
                WHERE user_id IN (SELECT id FROM usuarios_para_deletar)
                RETURNING *
            )
            DELETE FROM users
            WHERE id IN (SELECT id FROM usuarios_para_deletar)
            RETURNING *;
        `;

        const result = await client.query(query);
        await client.query('COMMIT');
        
        console.log(`✓ ${result.rowCount} usuários e seus links removidos com sucesso.`);
        return result.rowCount;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('✗ Erro ao remover dados de teste:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

export { insertTestUsers, cleanupTestData };