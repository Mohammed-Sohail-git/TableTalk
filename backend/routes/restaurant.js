const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, restaurantController.createRestaurant);
router.get('/', auth, restaurantController.getUserRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/:id', auth, restaurantController.updateRestaurant);
router.delete('/:id', auth, restaurantController.deleteRestaurant);

module.exports = router; 