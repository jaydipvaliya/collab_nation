import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, setRefreshCookie, clearRefreshCookie } from '../utils/generateTokens.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

// ── Register ──────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required.' });
    if (!['candidate', 'recruiter'].includes(role))
      return res.status(400).json({ message: 'Role must be candidate or recruiter.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const verifyToken = uuidv4();
    const user = await User.create({
      name, email,
      passwordHash: password,
      role,
      isVerified: false,
      verifyToken,
      verifyTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
    await sendEmail({ to: email, subject: 'Verify your Collab Nation account', html: emailTemplates.verification(name, verifyLink) });

    res.status(201).json({ message: 'Account created! Please check your email to verify.' });
  } catch (err) { next(err); }
};

// ── Verify Email ──────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verifyToken: token, verifyTokenExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) { next(err); }
};

// ── Login ─────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email before logging in.' });
    if (user.isBanned) return res.status(403).json({ message: 'Account suspended. Contact support.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

// ── Refresh Token ─────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token.' });
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || user.isBanned) return res.status(401).json({ message: 'Unauthorized.' });
    const accessToken = generateAccessToken(user._id, user.role);
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token invalid or expired.' });
  }
};

// ── Logout ────────────────────────────────────────────────
export const logout = (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: 'Logged out successfully.' });
};

// ── Set Role (after Google OAuth) ────────────────────────
export const setRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['candidate', 'recruiter'].includes(role))
      return res.status(400).json({ message: 'Invalid role.' });
    const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true }).select('-passwordHash');
    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { next(err); }
};

// ── Forgot Password ───────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return same message to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const plainToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${plainToken}`;
    await sendEmail({ to: email, subject: 'Reset your Collab Nation password', html: emailTemplates.resetPassword(user.name, resetLink) });

    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
};

// ── Reset Password ────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    if (!password || password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetToken: hashedToken, resetTokenExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' });

    user.passwordHash = password;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) { next(err); }
};

// ── Google OAuth Callback ─────────────────────────────────
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    if (!user.role) {
      return res.redirect(`${process.env.FRONTEND_URL}/onboarding?token=${accessToken}&newUser=true`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${accessToken}`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};
