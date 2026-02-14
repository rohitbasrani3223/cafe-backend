require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        const resMenu = await pool.query("SELECT COUNT(*) FROM menu");
        const resMenuItems = await pool.query("SELECT COUNT(*) FROM menu_items");
        console.log(`Rows in 'menu': ${resMenu.rows[0].count}`);
        console.log(`Rows in 'menu_items': ${resMenuItems.rows[0].count}`);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
