const Loyalty = require('../models/Loyalty');

exports.getLoyalty = async (req, res) => {
  try {
    const loyalty = await Loyalty.findOne({ user: req.user.userId });
    res.json(loyalty || { points: 0, rewards: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addPoints = async (req, res) => {
  try {
    const { points } = req.body;
    let loyalty = await Loyalty.findOne({ user: req.user.userId });
    if (!loyalty) {
      loyalty = new Loyalty({ user: req.user.userId, points, rewards: [] });
    } else {
      loyalty.points += points;
    }
    await loyalty.save();
    res.json(loyalty);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.redeemReward = async (req, res) => {
  try {
    const { reward } = req.body;
    let loyalty = await Loyalty.findOne({ user: req.user.userId });
    if (!loyalty || loyalty.points < 10) return res.status(400).json({ message: 'Not enough points' });
    loyalty.points -= 10;
    loyalty.rewards.push(reward);
    await loyalty.save();
    res.json(loyalty);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 