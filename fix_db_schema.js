require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    const client = await pool.connect();
    try {
        console.log("Starting DB Fix...");

        await client.query('BEGIN');

        // 1. Drop the incorrect table
        console.log("Dropping incorrect 'order_items' table...");
        await client.query('DROP TABLE IF EXISTS order_items');

        // 2. Drop the unused 'menu' table to avoid confusion
        console.log("Dropping unused 'menu' table...");
        await client.query('DROP TABLE IF EXISTS menu');

        // 3. Recreate order_items referencing menu_items
        console.log("Recreating 'order_items' linked to 'menu_items'...");
        // Using gen_random_uuid() which is standard in Supabase/Postgres 13+
        await client.query(`
            CREATE TABLE order_items (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
                menu_id UUID REFERENCES menu_items(id),
                quantity INTEGER NOT NULL,
                price NUMERIC NOT NULL
            );
        `);

        await client.query('COMMIT');
        console.log("✅ Database fixed successfully! Now 'order_items' references 'menu_items'.");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Error fixing DB:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
})();
