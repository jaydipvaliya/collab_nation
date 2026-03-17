import mongoose from 'mongoose';

// ── Application ──────────────────────────────────────────
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: {
    type: String,
    enum: ['applied','reviewing','interview','offer','rejected'],
    default: 'applied',
  },
  recruiterNotes: { type: String, default: '' },
  candidateNote: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);

// ── Message ───────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);

// ── Notification ──────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_application','status_changed','new_message','job_closing_soon','profile_view','system'],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  isRead: { type: Boolean, default: false },
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // TTL 30 days
});

export const Notification = mongoose.model('Notification', notificationSchema);

// ── Company Review ────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  pros: String,
  cons: String,
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);

// ── Admin Log ─────────────────────────────────────────────
const adminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  target: String,
  details: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export const AdminLog = mongoose.model('AdminLog', adminLogSchema);
