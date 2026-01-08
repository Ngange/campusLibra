require('dotenv').config(); // Load environment variables from .env file

const connectDB = require('./src/config/db'); // Import database connection function
const { createRolesIfNotExists } = require('./src/utils/role.util'); // Import initial Role setup utility
const app = require('./app'); // Import the Express app

const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
connectDB().then(async () => {
  // initial roles setup tasks
  await createRolesIfNotExists();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
