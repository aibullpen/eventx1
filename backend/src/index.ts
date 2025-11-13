import express, { Application } from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import attendeeRoutes from './routes/attendees';
import webhookRoutes from './routes/webhooks';


const app: Application = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [process.env.FRONTEND_URL || 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutes
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.COOKIE_DOMAIN || undefined
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', attendeeRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Event Management System API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
