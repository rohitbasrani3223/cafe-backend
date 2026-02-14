const pool = require('../config/db');

exports.createItem = async (req, res) => {
    try {
        const { name, price, category, cost_price, stock } = req.body;

        const result = await pool.query(
            `INSERT INTO menu_items (name, price, category, cost_price, stock) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, price, category, cost_price || 0, stock || 0]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMenu = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM menu_items ORDER BY created_at DESC'
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, cost_price, stock } = req.body;

        const result = await pool.query(
            `UPDATE menu_items 
             SET name = $1, price = $2, category = $3, 
                 cost_price = $4, stock = $5
             WHERE id = $6 RETURNING *`,
            [name, price, category, cost_price || 0, stock || 0, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM menu_items WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
