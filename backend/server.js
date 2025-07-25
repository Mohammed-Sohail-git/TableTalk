const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant');
const tableRoutes = require('./routes/table');
const feedbackRoutes = require('./routes/feedback');
const loyaltyRoutes = require('./routes/loyalty');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('TableTalk Backend API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 