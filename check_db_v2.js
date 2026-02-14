require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        const res = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log("--- START TABLES ---");
        res.rows.forEach(r => console.log(r.table_name));
        console.log("--- END TABLES ---");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
