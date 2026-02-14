const pool = require('../config/db');

exports.createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const { items, payment_method } = req.body;
        const user_id = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }

        await client.query('BEGIN');

        let totalAmount = 0;
        let totalProfit = 0;
        const orderItemsData = [];

        for (let item of items) {
            const menuItemResult = await client.query(
                'SELECT price, cost_price FROM menu_items WHERE id = $1',
                [item.menu_id]
            );

            if (menuItemResult.rows.length === 0) {
                throw new Error(`Menu item with id ${item.menu_id} not found`);
            }

            const { price, cost_price } = menuItemResult.rows[0];
            const cost = parseFloat(cost_price) || 0;
            const sellingPrice = parseFloat(price);

            totalAmount += sellingPrice * item.quantity;
            totalProfit += (sellingPrice - cost) * item.quantity;

            orderItemsData.push({
                menu_id: item.menu_id,
                quantity: item.quantity,
                price: sellingPrice
            });
        }

        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, profit, payment_method) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, totalAmount, totalProfit, payment_method]
        );

        const order_id = orderResult.rows[0].id;

        for (let data of orderItemsData) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order_id, data.menu_id, data.quantity, data.price]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: "Order created successfully 🔥",
            order_id,
            totalAmount,
            totalProfit
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT o.id, o.total_amount, o.payment_method, o.status, o.created_at,
             u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT * FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Note: With ON DELETE CASCADE on order_items, deleting from orders is enough, 
        // but explicit deletion is also fine and safe.
        await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
        await pool.query('DELETE FROM orders WHERE id = $1', [id]);

        res.json({ message: "Order deleted successfully 🔥" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDailyStats = async (req, res) => {
    try {
        // Sales & Profit for Today
        const salesResult = await pool.query(`
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(profit), 0) as total_profit,
                COUNT(*) as order_count
            FROM orders
            WHERE DATE(created_at) = CURRENT_DATE
        `);

        // Expenses for Today
        const expenseResult = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total_expenses
            FROM expenses
            WHERE DATE(created_at) = CURRENT_DATE
        `);

        const revenue = parseFloat(salesResult.rows[0].total_revenue);
        const profit = parseFloat(salesResult.rows[0].total_profit);
        const expenses = parseFloat(expenseResult.rows[0].total_expenses);
        const netProfit = profit - expenses; // Real Net Profit formula

        res.json({
            date: new Date(),
            revenue,
            profit,
            expenses,
            netProfit,
            orderCount: parseInt(salesResult.rows[0].order_count)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMonthlyStats = async (req, res) => {
    try {
        // Sales & Profit for This Month
        const salesResult = await pool.query(`
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(profit), 0) as total_profit,
                COUNT(*) as order_count
            FROM orders
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `);

        // Expenses for This Month
        const expenseResult = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total_expenses
            FROM expenses
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `);

        const revenue = parseFloat(salesResult.rows[0].total_revenue);
        const profit = parseFloat(salesResult.rows[0].total_profit);
        const expenses = parseFloat(expenseResult.rows[0].total_expenses);
        const netProfit = profit - expenses;

        res.json({
            month: new Date().toLocaleString('default', { month: 'long' }),
            revenue,
            profit,
            expenses,
            netProfit,
            orderCount: parseInt(salesResult.rows[0].order_count)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
