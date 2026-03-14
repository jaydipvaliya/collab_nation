import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { pathToFileURL } from 'node:url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import startupRoutes from './routes/startupRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the CollabNation API.',
    docs: {
      health: '/api/health',
      startups: '/api/startups',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/startups', startupRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  startServer();
}

export { app, startServer };
