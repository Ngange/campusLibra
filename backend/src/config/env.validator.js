const requiredEnvVars = ['PORT', 'JWT_SECRET', 'NODE_ENV'];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  // Check for at least one MongoDB URI (Atlas or local)
  if (!process.env.MONGODB_ATLAS_URI && !process.env.MONGODB_URI) {
    missing.push('MONGODB_URI or MONGODB_ATLAS_URI');
  }

  if (missing.length > 0) {
    console.error(
      'Missing required environment variables:',
      missing.join(', ')
    );
    console.error(
      'Please check your .env file and ensure all required variables are set.'
    );
    process.exit(1);
  }

  console.log('Environment variables validated successfully');
};

module.exports = { validateEnv };
