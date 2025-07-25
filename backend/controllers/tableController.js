const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const QRCode = require('qrcode');

exports.createTable = async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.body;
    // Check if user owns the restaurant
    const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user.userId });
    if (!restaurant) return res.status(403).json({ message: 'Unauthorized' });
    // Generate QR code string (URL placeholder)
    const qrString = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/feedback/${restaurantId}/${tableNumber}`;
    const qrCode = await QRCode.toDataURL(qrString);
    const table = new Table({ restaurant: restaurantId, tableNumber, qrCode });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTablesByRestaurant = async (req, res) => {
  try {
    const tables = await Table.find({ restaurant: req.params.restaurantId });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Not found' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: 'Not found' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 