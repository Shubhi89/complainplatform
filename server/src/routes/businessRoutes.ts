import express, { Request, Response } from 'express';
import { requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { upload } from '../config/cloudinary';
import BusinessProfile, { VerificationStatus } from '../models/BusinessProfile';
import User from '../models/User';

const router = express.Router();

// @route   POST /api/business/verification
// @desc    Upload document and submit business profile
// @access  Protected (Business Only)
router.post(
  '/verification',
  requireRole([UserRole.BUSINESS]), // Only Business users can do this
  upload.single('document'),        // Expect a file field named "document"
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Check if file was uploaded
      if (!req.file) {
        res.status(400).json({ message: 'Document file is required' });
        return;
      }

      const { companyName, industry, description } = req.body;

      // 2. Create the Business Profile
      // req.user is guaranteed to exist because of requireRole middleware
      const userId = (req.user as any)._id;

      // Check if profile already exists
      const existingProfile = await BusinessProfile.findOne({ user: userId });
      if (existingProfile) {
         res.status(400).json({ message: 'Profile already submitted' });
         return;
      }

      const newProfile = await BusinessProfile.create({
        user: userId,
        companyName,
        industry,
        description,
        documentUrl: req.file.path, // The Secure Cloudinary URL
        status: VerificationStatus.PENDING
      });

      // 3. Update User model to reflect that verification is in progress (optional but good for UI)
      // We keep isVerified false until Admin approves it.
      
      res.status(201).json({ 
        success: true, 
        message: 'Verification submitted successfully',
        profile: newProfile 
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

export default router;