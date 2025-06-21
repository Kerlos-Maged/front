// This file is deprecated for Vercel serverless deployment. All logic has been moved to /api routes.
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import competitionRoutes from './routes/competitionRoutes.js';
import authRoutes from './routes/auth.js';
import errorHandler from './middleware/error.js';
import morgan from 'morgan';

// Load environment variables
dotenv.config({ path: './src/config/env.js' });

// Create Express app
const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Parse JSON bodies
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// Security middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   crossOriginOpenerPolicy: { policy: "unsafe-none" },
//   crossOriginEmbedderPolicy: false
// }));

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Apply rate limiting to auth routes
app.use('/api/auth', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/competition', competitionRoutes);

// Error handling
app.use(errorHandler);

// Basic route for testing
app.get('/api/health', async (req, res) => {
  await connectDB();
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export app for serverless deployment
export default app;

// Connect to MongoDB when not in production (for local development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
  });
} 