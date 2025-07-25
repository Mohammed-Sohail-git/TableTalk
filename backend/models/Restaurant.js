const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: String },
  specialty: { type: String },
  numTables: { type: Number, required: true },
  description: { type: String },
  location: { type: String },
  openingDate: { type: Date },
  type: { type: String, enum: ['main', 'branch'], default: 'main' },
  branchNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema); 