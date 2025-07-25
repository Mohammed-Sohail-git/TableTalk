const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  rewards: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Loyalty', loyaltySchema); 