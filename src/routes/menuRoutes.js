const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, checkRole('owner'), menuController.createItem);
router.get('/', menuController.getMenu);
router.put('/:id', authMiddleware, checkRole('owner'), menuController.updateItem);
router.delete('/:id', authMiddleware, checkRole('owner'), menuController.deleteItem);

module.exports = router;
