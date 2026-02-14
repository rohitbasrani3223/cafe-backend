const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Debug Route
router.get('/', (req, res) => {
    res.send("Auth Router is Working! 🚀");
});

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: "Protected route working 🔥",
        user: req.user
    });
});

module.exports = router;
