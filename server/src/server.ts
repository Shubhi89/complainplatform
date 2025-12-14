import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import session from 'express-session';
import passport from 'passport';
import './config/passport'; // Execute the passport config
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import businessRoutes from './routes/businessRoutes';

// Load environment variables


// Connect to Database
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());         // Allow cross-origin requests
app.use(helmet());       // Security headers
app.use(morgan('dev'));  // Logger

// Session Configuration
app.use(
  session({
    secret: process.env.COOKIE_KEY || 'secret_key',
    resave: false,             // Don't save session if unmodified
    saveUninitialized: false,  // Don't create session until something stored
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); 

// Routes
app.use('/auth', authRoutes); // Handles /auth/google
app.use(authRoutes);          // Handles /api/current_user (since we defined it with /api prefix inside)
// Admin Routes (Prefix with /api/admin)
app.use('/api/admin', adminRoutes);
// Business Routes
app.use('/api/business', businessRoutes);

// Basic Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.send('MERN Complaint Platform API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});