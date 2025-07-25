const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  ratings: {
    service: { type: Number, min: 1, max: 5 },
    food: { type: Number, min: 1, max: 5 },
    ambiance: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
  },
  comments: { type: String },
  sentiment: { type: String },
  keywords: [{ type: String }],
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  customerPhone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema); 