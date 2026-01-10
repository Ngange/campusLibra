// src/jobs/expiredHolds.job.js
const cron = require('node-cron');
const { expireHoldReservations } = require('../services/reservation.service');

// Schedule the job to run every hour
cron.schedule('0 * * * *', expireHoldReservations);

// Export for testing or manual triggering
module.exports = { expireHoldReservations };
