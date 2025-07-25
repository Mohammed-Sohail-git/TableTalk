const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, loyaltyController.getLoyalty);
router.post('/add', auth, loyaltyController.addPoints);
router.post('/redeem', auth, loyaltyController.redeemReward);

module.exports = router; 