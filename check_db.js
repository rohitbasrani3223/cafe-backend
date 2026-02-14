const pool = require('./src/config/db');

async function checkTables() {
    try {
        const res = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log("Tables in database:", res.rows.map(r => r.table_name));
    } catch (err) {
        console.error("Error checking tables:", err);
    } finally {
        // We do not close the pool here as it might hang, just exit manually or let script finish
        process.exit();
    }
}

checkTables();
