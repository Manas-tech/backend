import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import database connection
import { connectToMongoDB } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blogs.js';
import portfolioRoutes from './routes/portfolio.js';
import serviceRoutes from './routes/services.js';
import purchaseRoutes from './routes/purchases.js';
import onboardingRoutes from './routes/onboarding.js';
import progressRoutes from './routes/progress.js';
import contactRoutes from './routes/contact.js';
import projectRoutes from './routes/projects.js';
import cartRoutes from './routes/cart.js';
import uploadRoutes from './routes/upload.js';
import projectWorkflowRoutes from './routes/projectWorkflow.js';
import serviceConsumptionRoutes from './routes/serviceConsumption.js';
import testimonialRoutes from './routes/testimonials.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'https://idea2mvp-ivory.vercel.app',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({origin:"*"}));

// Rate limiting - Disabled for development
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

if (!isDevelopment) {
  // Only apply rate limiting in production
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests for production
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);
  console.log('🛡️ Rate limiting enabled for production');
} else {
  console.log('🚀 Rate limiting disabled for development');
}

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/project-workflow', projectWorkflowRoutes);
app.use('/api/service-consumption', serviceConsumptionRoutes);
app.use('/api/testimonials', testimonialRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

