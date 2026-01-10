const requiredEnvVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'NODE_ENV'];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

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
