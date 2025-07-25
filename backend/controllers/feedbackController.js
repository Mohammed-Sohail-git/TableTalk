const Feedback = require('../models/Feedback');
const Table = require('../models/Table');
const Sentiment = require('sentiment');
const nlp = require('compromise');

exports.createFeedback = async (req, res) => {
  try {
    let { table, ratings, comments, user, restaurant, tableNumber, customerName, customerPhone } = req.body;
    if ((!table || table.length < 10) && restaurant && tableNumber) {
      const foundTable = await Table.findOne({ restaurant, tableNumber });
      if (!foundTable) return res.status(400).json({ message: 'Table not found' });
      table = foundTable._id;
    }
    
    const sentiment = new Sentiment();
    const sentimentResult = sentiment.analyze(comments || '');
    
    const doc = nlp(comments || '');
    const keywords = doc.nouns().out('array');
    const feedback = new Feedback({
      table,
      ratings,
      comments,
      sentiment: sentimentResult.score > 0 ? 'positive' : sentimentResult.score < 0 ? 'negative' : 'neutral',
      keywords,
      user: user || undefined,
      customerName,
      customerPhone,
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFeedbackByTable = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ table: req.params.tableId });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFeedbackByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    // Find all tables for this restaurant
    const Table = require('../models/Table');
    const tables = await Table.find({ restaurant: restaurantId });
    const tableIds = tables.map(t => t._id);
    // Find all feedback for these tables, populate tableNumber
    const feedback = await Feedback.find({ table: { $in: tableIds } })
      .sort({ createdAt: -1 })
      .populate({ path: 'table', select: 'tableNumber' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 