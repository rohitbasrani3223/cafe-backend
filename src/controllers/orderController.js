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

        for (let item of items) {
            // Using 'menu_items' table as established previously
            const menuItem = await client.query(
                'SELECT price FROM menu_items WHERE id = $1',
                [item.menu_id]
            );

            if (menuItem.rows.length === 0) {
                throw new Error(`Menu item with id ${item.menu_id} not found`);
            }

            const price = menuItem.rows[0].price;
            totalAmount += price * item.quantity;
        }

        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, payment_method) VALUES ($1, $2, $3) RETURNING *',
            [user_id, totalAmount, payment_method]
        );

        const order_id = orderResult.rows[0].id;

        for (let item of items) {
            const menuItem = await client.query(
                'SELECT price FROM menu_items WHERE id = $1',
                [item.menu_id]
            );

            await client.query(
                'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order_id, item.menu_id, item.quantity, menuItem.rows[0].price]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: "Order created successfully 🔥",
            order_id,
            totalAmount
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
