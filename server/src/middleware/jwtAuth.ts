import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface TokenPayload {
  _id: string;
  role: string;
  iat: number;
  exp: number;
}

export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // 1. Check if the header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token? Continue without a user.
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

    // 3. Find the user in the database
    const user = await User.findById(decoded._id).select('-password');

    if (user) {
      // 4. Attach the user to the request object
      req.user = user; 
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    // If token is invalid, we proceed (req.user remains undefined)
  }

  next();
};