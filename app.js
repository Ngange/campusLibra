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

// routes
const authRoutes = require('./src/routes/auth.routes');
const borrowRoutes = require('./src/routes/borrow.routes');
const reservationRoutes = require('./src/routes/reservation.routes');
const fineRoutes = require('./src/routes/fine.routes');
const bookRoutes = require('./src/routes/book.routes');

app.use('/api/auth', authRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/books', bookRoutes);

module.exports = app;
