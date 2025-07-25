const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, tableController.createTable);
router.get('/restaurant/:restaurantId', auth, tableController.getTablesByRestaurant);
router.get('/:id', auth, tableController.getTableById);
router.put('/:id', auth, tableController.updateTable);
router.delete('/:id', auth, tableController.deleteTable);

module.exports = router; 