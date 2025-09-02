const { Pool } = require('pg');

class CockroachDBUtil {
    constructor(config) {
        this.pool = new Pool({
            user: config.username,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port,
            ssl: config.isSSL ? { rejectUnauthorized: false } : false,
            max: config.poolSize || 10, // max connections
            idleTimeoutMillis: 30000,   // close idle clients after 30s
            connectionTimeoutMillis: 2000, // fail if connection takes >2s
        });
    }

    async executeQuery({ query, values = [] }) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(query, values);
            return result;
        } catch (err) {
            console.error('Query error:', err);
            throw err;
        } finally {
            client.release(); // Important: return the client to the pool
        }
    }

    async closePool() {
        await this.pool.end();
        console.log('Connection pool closed');
    }
}

module.exports = CockroachDBUtil;
