const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log('--- Migrating Database ---');

        // Add profit column to orders
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS profit DECIMAL(10, 2) DEFAULT 0.00;");
        console.log('Profit column check/add complete.');

        // Check expenses table exists
        const expenseRes = await pool.query("SELECT to_regclass('public.expenses');");
        if (!expenseRes.rows[0].to_regclass) {
            console.log('Creating expenses table...');
            await pool.query(`
            CREATE TABLE expenses (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
            console.log('Expenses table created.');
        } else {
            console.log('Expenses table already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();
