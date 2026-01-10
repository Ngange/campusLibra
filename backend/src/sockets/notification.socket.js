const Notification = require('../models/notification.model');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room for targeted notifications
    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
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

  return { emitNotification };
};

module.exports = setupSocketIO;
