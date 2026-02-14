require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 👇 VERY IMPORTANT
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Shakti Cafe Backend Running 🚀');
});

// 404 handler (LAST me hi hona chahiye)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found bro" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Registered Routes:");
  console.log("  - POST /api/auth/register");
  console.log("  - POST /api/auth/login");
  console.log("  - GET /api/auth/me");
  console.log("  - POST /api/menu");
  console.log("  - GET /api/menu");
  console.log("  - POST /api/orders");
  console.log("  - GET /");
});
