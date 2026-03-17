import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['candidate', 'recruiter', 'admin', null], default: null },
  avatar: { type: String, default: '' },
  googleId: { type: String, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
  resetToken: String,
  resetTokenExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  followedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  notificationPrefs: {
    emailOnApply: { type: Boolean, default: true },
    emailOnStatusChange: { type: Boolean, default: true },
    emailOnMessage: { type: Boolean, default: true },
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
