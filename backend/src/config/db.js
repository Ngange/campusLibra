// connect to MongoDB database
const mongoose = require('mongoose'); // Import mongoose for MongoDB connection

// Function to connect to the database
const connectDB = async () => {
  try {
    // Use Atlas URI if available, otherwise fall back to local MongoDB
    const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

    // Connect to MongoDB using the determined URI
    const conn = await mongoose.connect(mongoURI);

    // Determine connection type for logging
    const connectionType = process.env.MONGODB_ATLAS_URI ? 'Atlas' : 'Local';
    console.log(
      `MongoDB Connected (${connectionType}): ${conn.connection.host}`
    );
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    // Log any connection errors
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
