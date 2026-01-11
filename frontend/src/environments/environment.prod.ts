// Production environment and Current version
export const environment = {
  // Build mode: production, Application name
  production: true,
  appName: 'CampusLibra',
  appVersion: '1.0.0',

// TODO: update URL - Backend API endpoint, request timeout (ms)
  apiUrl: 'https://api.campuslibra.example.com/api',
  apiTimeout: 30000, // API request timeout (ms)
  tokenKey: 'auth_token',
  userKey: 'current_user',
  jwtExpiryHours: 3, // JWT expiration time (hours)

  // TODO: update URL - Socket.IO server and Reconnection delay (ms)
  socketUrl: 'https://api.campuslibra.example.com',

  socketReconnectDelay: 1000,
  itemsPerPage: 10, // Default pagination size
  sessionTimeoutMinutes: 60, // Session inactivity timeout (minutes)
  enableLogging: false,
  enableMockApi: false,
  logLevel: 'error',
  defaultPageSize: 10, // Default records per page
  maxPageSize: 100, // Maximum records per page
};
