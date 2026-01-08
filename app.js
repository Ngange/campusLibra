const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Sample route
app.get('/', (req, res) => {
  res.send('CampusLibra API is running');
});

// Import and use auth routes
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

module.exports = app;
