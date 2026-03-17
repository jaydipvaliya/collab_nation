import { Notification } from '../models/index.js';
import { io } from '../server.js';

export const createNotification = async ({ recipientId, type, title, message, link, data }) => {
  try {
    const notification = await Notification.create({ recipient: recipientId, type, title, message, link, data });
    io.to(recipientId.toString()).emit('notification', notification);
    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};
