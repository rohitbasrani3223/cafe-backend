const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/my', authMiddleware, orderController.getMyOrders);
router.get('/', authMiddleware, orderController.getAllOrders);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;
