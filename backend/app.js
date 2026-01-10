const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./src/config/logger');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();

// Security middleware
app.use(helmet()); // Secure HTTP headers

// Custom NoSQL injection prevention middleware
// Sanitize request data by checking for $ and . characters
app.use((req, res, next) => {
  const sanitizeData = (data) => {
    if (typeof data === 'string') {
      if (data.includes('$') || data.includes('.')) {
        return data.replace(/\$/g, '_').replace(/\./g, '_');
      }
      return data;
    } else if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const key in data) {
        if (key.includes('$') || key.includes('.')) {
          sanitized[key.replace(/\$/g, '_').replace(/\./g, '_')] = sanitizeData(
            data[key]
          );
        } else {
          sanitized[key] = sanitizeData(data[key]);
        }
      }
      return sanitized;
    }
    return data;
  };

  // Sanitize body
  if (req.body) {
    req.body = sanitizeData(req.body);
  }
  next();
});

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS - restrict to your frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  })
);

// Request ID tracking
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

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
const userRoutes = require('./src/routes/user.routes');
const roleRoutes = require('./src/routes/role.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const settingRoutes = require('./src/routes/setting.routes');

app.use('/api/auth', authRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingRoutes);

// Global error handler
const errorHandler = require('./src/middlewares/error.middleware');
app.use(errorHandler);

module.exports = app;
