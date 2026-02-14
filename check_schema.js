const pool = require('./src/config/db');

async function checkSchema() {
    try {
        console.log('--- Orders Table Columns ---');
        const ordersRes = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';"
        );
        console.log(ordersRes.rows);

        console.log('--- Expenses Table Columns ---');
        const expensesRes = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'expenses';"
        );
        console.log(expensesRes.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkSchema();
