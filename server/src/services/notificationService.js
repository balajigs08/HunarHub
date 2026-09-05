const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, data = {}, link = '' }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
      link,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = { createNotification };
