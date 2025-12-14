import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

// Extend the Session type to include our custom flag
declare module 'express-session' {
  interface SessionData {
    isSecretVerified?: boolean;
  }
}

/**
 * Middleware to check if the user has the required Role
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    // 2. Check if user has the correct role
    const user = req.user as any; // (Type assertion for simplicity)
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // 3. SPECIAL CHECK: If user is ADMIN, they must also have verified the secret
    if (user.role === UserRole.ADMIN) {
      // We check the session for the flag
      if (!req.session.isSecretVerified) {
         // Specific error code tells Frontend to show "Enter Secret Code" screen
         return res.status(403).json({ 
           message: 'Security Challenge Required', 
           code: 'SECRET_REQUIRED' 
         });
      }
    }

    next();
  };
};