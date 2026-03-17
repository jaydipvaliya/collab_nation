import jwt from 'jsonwebtoken';
import { Message, Notification } from '../models/index.js';

export const initSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`);

    // Join personal room
    socket.join(socket.userId);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Send message
    socket.on('send_message', async ({ conversationId, receiverId, content }) => {
      try {
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
        });
        const populated = await message.populate('sender', 'name avatar');
        io.to(conversationId).emit('receive_message', populated);
        io.to(receiverId).emit('new_message_notification', {
          conversationId,
          sender: populated.sender,
          preview: content.substring(0, 60),
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async (conversationId) => {
      await Message.updateMany(
        { conversationId, receiver: socket.userId, isRead: false },
        { isRead: true }
      );
      io.to(conversationId).emit('messages_read', { conversationId, readBy: socket.userId });
    });

    // Typing indicators
    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('typing', { userId: socket.userId });
    });
    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId).emit('stop_typing', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`);
    });
  });
};
