const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: Number, required: true },
  qrCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema); 