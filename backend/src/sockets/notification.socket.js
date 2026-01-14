const Notification = require('../models/notification.model');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room for targeted notifications
    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Join dashboard room for real-time updates
    socket.on('joinDashboard', (data) => {
      const { userId, role } = data;
      socket.join('dashboard-all'); // All users get general updates
      socket.join(`dashboard-${role}`); // Role-specific updates
      console.log(`User ${userId} joined dashboard rooms: all, ${role}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Helper function to emit notification to a specific user
  const emitNotification = async (userId, notificationId) => {
    try {
      const notification = await Notification.findById(notificationId).populate(
        'relatedId'
      );

      if (notification) {
        io.to(userId).emit('newNotification', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          createdAt: notification.createdAt,
          isRead: notification.isRead,
        });
      }
    } catch (error) {
      console.error('Socket emit error:', error);
    }
  };

  // Helper function to emit dashboard updates
  const emitDashboardUpdate = (roles = ['admin', 'librarian', 'member']) => {
    try {
      const timestamp = new Date().toISOString();
      // Emit to all dashboard rooms
      io.to('dashboard-all').emit('dashboardUpdate', { timestamp });
      // Emit to specific role rooms
      roles.forEach((role) => {
        io.to(`dashboard-${role}`).emit('dashboardUpdate', { timestamp, role });
      });
      console.log('Dashboard update emitted to roles:', roles);
    } catch (error) {
      console.error('Dashboard update emit error:', error);
    }
  };

  return { emitNotification, emitDashboardUpdate };
};

module.exports = setupSocketIO;
