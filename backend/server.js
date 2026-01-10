require('dotenv').config(); // Load environment variables from .env file
require('./src/jobs/expiredHolds.job'); // Starts cron job

const connectDB = require('./src/config/db'); // Import database connection function
const { createRolesIfNotExists } = require('./src/utils/role.util');
const { createSettingsIfNotExists } = require('./src/utils/setting.util');
const { createPermissionsIfNotExists } = require('./src/utils/permission.util');

const app = require('./app'); // Import the Express app

const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
connectDB().then(async () => {
  // initial roles setup tasks
  await createPermissionsIfNotExists();
  await createRolesIfNotExists();
  await createSettingsIfNotExists();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
