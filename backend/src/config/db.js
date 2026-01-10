// connect to MongoDB database
const mongoose = require('mongoose'); // Import mongoose for MongoDB connection

// Function to connect to the database
const connectDB = async () => {
  try {
    // Connect to MongoDB using environment variable for URI
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any connection errors
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
