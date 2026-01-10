require('dotenv').config(); // Load environment variables from .env file
require('./src/jobs/expiredHolds.job'); // Starts cron job

const connectDB = require('./src/config/db'); // Import database connection function
const { createRolesIfNotExists } = require('./src/utils/role.util');
const { createSettingsIfNotExists } = require('./src/utils/setting.util');
const { createPermissionsIfNotExists } = require('./src/utils/permission.util');

const app = require('./app'); // Import the Express app

const http = require('http');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
connectDB().then(async () => {
  await createPermissionsIfNotExists();
  await createRolesIfNotExists();
  await createSettingsIfNotExists();

  // Create HTTP server for Socket.IO
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      methods: ['GET', 'POST'],
    },
  });

  // Setup Socket.IO
  const { emitNotification } = require('./src/sockets/notification.socket')(io);

  // Make emitNotification globally available
  global.emitNotification = emitNotification;

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO ready`);
  });
});
