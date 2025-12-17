import express, { Request, Response, NextFunction } from 'express';
import { requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import BusinessProfile, { VerificationStatus } from '../models/BusinessProfile';
import User from '../models/User';

const router = express.Router();

// --- MIDDLEWARE: Security Check ---
// This ensures the user has entered the secret code in the current session
const requireSecret = (req: Request, res: Response, next: NextFunction) => {
  // Check the session flag
  if (!req.session || !(req.session as any).isSecretVerified) {
    // Return a specific flag (requiresSecret) so frontend knows to redirect
    return res.status(403).json({ 
      message: 'Admin Secret Required', 
      requiresSecret: true 
    });
  }
  next();
};

// 1. VERIFY SECRET ROUTE (Public to Admin Role)
// This is the only route they can access WITHOUT the secret (to submit it)
router.post('/verify-secret', requireRole([UserRole.ADMIN]), (req: Request, res: Response) => {
  const { secret } = req.body;
  const correctCode = process.env.ADMIN_SECRET_CODE;

  

  if (!secret || secret !== correctCode) {
    return res.status(401).json({ success: false, message: 'Invalid Secret Code' });
  }

  // Success! Mark this session as verified
  if (req.session) {
    (req.session as any).isSecretVerified = true;
    req.session.save(); // Force save
  }

  res.json({ success: true, message: 'Admin access granted' });
});

// 2. DATA ROUTES (Protected by requireSecret)

// @route   GET /admin/pending-verifications
router.get(
  '/pending-verifications',
  requireRole([UserRole.ADMIN]),
  requireSecret, // <--- BLOCKS access if secret not entered
  async (req: Request, res: Response) => {
    try {
      const pending = await BusinessProfile.find({ status: VerificationStatus.PENDING })
        .populate('user', 'email displayName');
      res.json(pending);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// @route   POST /admin/approve-business
router.post(
  '/approve-business',
  requireRole([UserRole.ADMIN]),
  requireSecret, // <--- BLOCKS access if secret not entered
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { profileId, action, reason } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(action)) {
        res.status(400).json({ message: 'Invalid action' });
        return;
      }

      const profile = await BusinessProfile.findById(profileId);
      if (!profile) {
        res.status(404).json({ message: 'Profile not found' });
        return;
      }

      profile.status = action;
      if (action === 'REJECTED') {
        profile.rejectionReason = reason;
      }
      await profile.save();

      if (action === 'APPROVED') {
        await User.findByIdAndUpdate(profile.user, { isVerified: true });
      }

      res.json({ success: true, message: `Business ${action}` });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get(
  '/stats',
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      // 1. Count Consumers (Users who are strictly consumers)
      const totalUsers = await User.countDocuments({ role: UserRole.CONSUMER });

      // 2. Count Total Businesses (Anyone with the Business Role)
      const totalBusinesses = await User.countDocuments({ role: UserRole.BUSINESS });

      // 3. Count Verified Businesses (Only those with APPROVED profiles)
      const verifiedBusinesses = await BusinessProfile.countDocuments({ status: 'APPROVED' });

      // 4. (Optional) Pending Verifications Count
      const pendingVerifications = await BusinessProfile.countDocuments({ status: 'PENDING' });

      res.json({
        totalUsers,
        totalBusinesses,
        verifiedBusinesses,
        pendingVerifications
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

export default router;