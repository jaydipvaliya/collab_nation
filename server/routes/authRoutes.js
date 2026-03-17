// ── authRoutes.js ─────────────────────────────────────────
import { Router } from 'express';
import passport from 'passport';
import { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword, googleCallback, setRole } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/set-role', protect, setRole);
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`, session: false }), googleCallback);

export default router;
