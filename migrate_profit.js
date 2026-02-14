const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log('--- Migrating Database ---');

        // Check if `profit` column exists in `orders`
        const checkProfit = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'profit';"
        );

        if (checkProfit.rows.length === 0) {
            console.log('Adding profit column to orders table...');
            await pool.query("ALTER TABLE orders ADD COLUMN profit DECIMAL(10, 2) DEFAULT 0.00;");
            console.log('Profit column added.');
        } else {
            console.log('Profit column already exists.');
        }

        // Check expense table columns just in case
        const expenseCols = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'expenses';"
        );
        console.log('Expense Columns:', expenseCols.rows.map(r => r.column_name));


    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        pool.end();
    }
}

migrate();
