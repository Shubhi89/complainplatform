import express, { Request, Response } from 'express';
import { requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { upload } from '../config/cloudinary';
import BusinessProfile, { VerificationStatus } from '../models/BusinessProfile';
import User from '../models/User';

const router = express.Router();


router.post(
  '/verification',
  requireRole([UserRole.BUSINESS]), 
  upload.single('document'),        
  async (req: Request, res: Response): Promise<void> => {
    try {
      
      if (!req.file) {
        res.status(400).json({ message: 'Document file is required' });
        return;
      }

      const { companyName, industry, description } = req.body;

      
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
        documentUrl: req.file.path, 
        status: VerificationStatus.PENDING
      });

      
      
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

router.get(
  '/me',
  requireRole([UserRole.BUSINESS]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)._id;
      const profile = await BusinessProfile.findOne({ user: userId });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get('/verified', async (req: Request, res: Response) => {
  try {
    // Only fetch APPROVED profiles
    const businesses = await BusinessProfile.find({ status: 'APPROVED' })
      .select('companyName industry user logoUrl'); 
      
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;