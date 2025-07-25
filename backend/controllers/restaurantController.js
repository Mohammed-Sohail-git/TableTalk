const Restaurant = require('../models/Restaurant');

exports.createRestaurant = async (req, res) => {
  try {
    const { name, photo, specialty, numTables, description, location, openingDate, type, branchNumber } = req.body;
    const restaurant = new Restaurant({
      name,
      owner: req.user.userId,
      photo,
      specialty,
      numTables,
      description,
      location,
      openingDate: openingDate ? new Date(openingDate) : undefined,
      type,
      branchNumber,
    });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user.userId });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.openingDate) updateData.openingDate = new Date(updateData.openingDate);
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      updateData,
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!restaurant) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 