import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulid';
import dotenv from 'dotenv';

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
    try {
        await client.query('BEGIN');

        // Criptografa a senha uma vez para reutilizar
        const hashedPassword = await bcrypt.hash('pwd123', 10);

        // Prepara os valores para inserção em lote
        const users = [];
        for (let i = 0; i < 2000; i++) {
            const userId = ulid();
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({
                firstName,
                lastName,
                provider: 'qtech.dev'
            }).toLowerCase();

            users.push({
                id: userId,
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`
            });
        }

        // Inserção em lote (mais eficiente)
        const batchSize = 100;
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

            await client.query(query, values);
        }

        await client.query('COMMIT');
        console.log('2000 usuários inseridos com sucesso!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao inserir usuários:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function cleanupTestData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
            WITH usuarios_para_deletar AS (
                SELECT id FROM users WHERE email LIKE '%@qtech.dev'
            ),
            delete_links AS (
                DELETE FROM links
                WHERE user_id IN (SELECT id FROM usuarios_para_deletar)
            )
            DELETE FROM users
            WHERE id IN (SELECT id FROM usuarios_para_deletar);
        `;

        await client.query(query);

        await client.query('COMMIT');
        console.log('Usuários e links de teste removidos com sucesso.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao remover dados de teste:', err);
    } finally {
        client.release();
    }
}

export { insertTestUsers, cleanupTestData };