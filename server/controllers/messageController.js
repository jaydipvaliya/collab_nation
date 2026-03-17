import { Message, Notification } from '../models/index.js';

// ─────────────────────────────────────────────────────────
// MESSAGE CONTROLLER
// ─────────────────────────────────────────────────────────

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).sort({ createdAt: -1 }).populate('sender', 'name avatar').populate('receiver', 'name avatar');

    // Group by conversationId, keep only latest
    const convMap = {};
    messages.forEach(m => {
      if (!convMap[m.conversationId]) {
        const other = m.sender._id.toString() === userId ? m.receiver : m.sender;
        convMap[m.conversationId] = { conversationId: m.conversationId, otherUser: other, lastMessage: m.content, lastTime: m.createdAt, unreadCount: 0 };
      }
      if (!m.isRead && m.receiver._id.toString() === userId) {
        convMap[m.conversationId].unreadCount++;
      }
    });

    res.json({ conversations: Object.values(convMap) });
  } catch (err) { next(err); }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.user._id.toString();
    const otherId = req.params.userId;
    const conversationId = [myId, otherId].sort().join('_');
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ messages: messages.reverse(), conversationId });
  } catch (err) { next(err); }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ unreadCount: count });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────
// NOTIFICATION CONTROLLER
// ─────────────────────────────────────────────────────────

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ notifications });
  } catch (err) { next(err); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

export const markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    res.json({ message: 'Notification marked as read.' });
  } catch (err) { next(err); }
};

export const getNotifUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ unreadCount: count });
  } catch (err) { next(err); }
};
