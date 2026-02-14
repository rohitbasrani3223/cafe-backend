const pool = require('../config/db');

exports.createItem = async (req, res) => {
    try {
        const { name, price, category } = req.body;

        const result = await pool.query(
            'INSERT INTO menu_items (name, price, category) VALUES ($1, $2, $3) RETURNING *',
            [name, price, category]
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
        const { name, price, category } = req.body;

        const result = await pool.query(
            'UPDATE menu_items SET name = $1, price = $2, category = $3 WHERE id = $4 RETURNING *',
            [name, price, category, id]
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
