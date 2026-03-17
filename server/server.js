import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';

import { connectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './config/socket.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io
export const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});
initSocket(io);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// Rate limiting
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10000, message: 'Too many requests' });
app.use(globalLimiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session (for Passport OAuth only)
app.use(session({
  secret: process.env.SESSION_SECRET || 'collab-nation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 10 * 60 * 1000 }
}));

// Passport
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db: dbState, timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// Connect DB and start
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`🚀 Collab Nation server running on port ${PORT}`));
});
