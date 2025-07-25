const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/authMiddleware');

router.post('/', feedbackController.createFeedback); // public
router.get('/table/:tableId', auth, feedbackController.getFeedbackByTable);
router.get('/restaurant/:restaurantId', feedbackController.getFeedbackByRestaurant); // public for analytics
router.get('/:id', auth, feedbackController.getFeedbackById);
router.put('/:id', auth, feedbackController.updateFeedback);
router.delete('/:id', auth, feedbackController.deleteFeedback);

module.exports = router; 