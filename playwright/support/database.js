const { Pool } = require('pg');

// Configure sua conexão aqui
const pool = new Pool({
    user: 'dba',
    host: 'localhost',
    database: 'ShortDB',
    password: 'dba',
    port: 5432,
});

async function cleanupTestData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
      WITH usuarios_para_deletar AS (
        SELECT id FROM users WHERE email LIKE '%@papito.dev'
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

module.exports = { cleanupTestData }