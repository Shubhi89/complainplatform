import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());         // Allow cross-origin requests
app.use(helmet());       // Security headers
app.use(morgan('dev'));  // Logger

// Basic Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.send('MERN Complaint Platform API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});