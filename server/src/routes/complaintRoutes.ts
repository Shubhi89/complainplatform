import express, { Request, Response } from 'express';
import { requireRole } from '../middleware/authMiddleware';
import User, { UserRole } from '../models/User';
import Complaint, { ComplaintStatus } from '../models/Complaint';
import { generateCustomId } from '../services/idGenerator';
import BusinessProfile from '../models/BusinessProfile';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Protected (Consumer Only)
router.post(
  '/',
  requireRole([UserRole.CONSUMER]), // Only Consumers can complain
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, businessId } = req.body;

      if (!title || !description || !businessId) {
        res.status(400).json({ message: 'Please provide title, description, and business ID' });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        res.status(400).json({ message: 'Invalid Business ID format. It must be a 24-character code.' });
        return;
      }

      const businessUser = await User.findById(businessId);
      if (!businessUser || businessUser.role !== UserRole.BUSINESS) {
        res.status(404).json({ message: 'Business not found. Please check the ID.' });
        return;
      }

      // 1. Generate the unique Complaint ID (e.g., CMP-0005)
      const customId = await generateCustomId('complaint_id', 'CMP');

      // 2. Create the Complaint
      const userId = (req.user as any)._id;

      const newComplaint = await Complaint.create({
        complaintId: customId,
        title,
        description,
        consumer: userId,
        business: businessId, // The ID of the Business User
        status: ComplaintStatus.PENDING,
        thread: [] // Empty thread to start
      });

      res.status(201).json({ 
        success: true, 
        message: 'Complaint created successfully', 
        complaint: newComplaint 
      });

    } catch (error) {
      console.error("Create Complaint Error:", error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// @route   GET /api/complaints/my-complaints
// @desc    Get all complaints for the current user (Consumer)
// @access  Protected (Consumer)
router.get(
    '/my-complaints',
    requireRole([UserRole.CONSUMER]),
    async (req: Request, res: Response) => {
        try {
            const userId = (req.user as any)._id;
            const complaints = await Complaint.find({ consumer: userId })
                .sort({ createdAt: -1 }); // Newest first
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

// @route   GET /api/complaints/tagged
// @desc    Get complaints tagged to the current Business
// @access  Protected (Business Only)
router.get(
    '/tagged',
    requireRole([UserRole.BUSINESS]),
    async (req: Request, res: Response) => {
        try {
            const businessId = (req.user as any)._id;

            const profile = await BusinessProfile.findOne({ user: businessId });
            
            // If no profile or not approved, block access
            if (!profile || profile.status !== 'APPROVED') {
                return res.status(403).json({ 
                    message: 'Access Denied: Business not verified.',
                    code: 'NOT_VERIFIED' 
                });
            }
            
            const complaints = await Complaint.find({ business: businessId })
                .populate('consumer', 'displayName') // Show the consumer's name
                .sort({ createdAt: -1 });
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

// @route   POST /api/complaints/:id/reply
// @desc    Post a reply to a complaint
// @access  Protected (Consumer or Business involved in the complaint)
router.post(
    '/:id/reply',
    requireRole([UserRole.CONSUMER, UserRole.BUSINESS]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { content } = req.body;
            const complaintId = req.params.id;
            const user = req.user as any;

            const complaint = await Complaint.findById(complaintId);
            if (!complaint) {
                res.status(404).json({ message: 'Complaint not found' });
                return;
            }

            if (['RESOLVED', 'CLOSED'].includes(complaint.status)) {
                res.status(400).json({ message: 'This conversation is locked.' });
                return;
            }

            // Security Check: Ensure the user is actually part of this complaint
            const isConsumer = complaint.consumer.toString() === user._id.toString();
            const isBusiness = complaint.business.toString() === user._id.toString();

            if (!isConsumer && !isBusiness) {
                res.status(403).json({ message: 'Not authorized to reply to this complaint' });
                return;
            }

            // Create Reply Object
            const newReply = {
                userId: user._id,
                userName: user.displayName,
                role: user.role,
                content: content,
                timestamp: new Date()
            };

            // Add to thread
            complaint.thread.push(newReply);
            
            // Auto-update status if Business replies (shows they are active)
            if (isBusiness && complaint.status === ComplaintStatus.PENDING) {
                complaint.status = ComplaintStatus.OPEN;
            }

            await complaint.save();
            res.json(complaint);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

router.patch(
  '/:id/status',
  requireRole([UserRole.BUSINESS]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      const complaintId = req.params.id;
      const businessId = (req.user as any)._id;

      // Validate status enum
      if (!Object.values(ComplaintStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }

      const complaint = await Complaint.findOne({ 
        _id: complaintId, 
        business: businessId 
      });

      if (!complaint) {
        res.status(404).json({ message: 'Complaint not found or unauthorized' });
        return;
      }

      complaint.status = status;
      await complaint.save();

      res.json({ success: true, complaint });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get(
  '/:id',
  requireRole([UserRole.CONSUMER, UserRole.BUSINESS, UserRole.ADMIN]), // Admins might need to see it too
  async (req: Request, res: Response): Promise<void> => {
    try {
      const complaintId = req.params.id;
      const user = req.user as any;

      const complaint = await Complaint.findById(complaintId)
        .populate('consumer', 'displayName email')
        .populate('business', 'displayName email');

      if (!complaint) {
        res.status(404).json({ message: 'Complaint not found' });
        return;
      }

      const businessProfile = await BusinessProfile.findOne({ user: complaint.business._id });

      const complaintData = complaint.toObject();
      
      // Attach the company name if it exists
      if (businessProfile) {
        (complaintData.business as any).companyName = businessProfile.companyName;
      }

      // Security: Only allow the Consumer, the Business, or an Admin to view this
      const isConsumer = complaint.consumer._id.toString() === user._id.toString();
      const isBusiness = complaint.business._id.toString() === user._id.toString();
      const isAdmin = user.role === UserRole.ADMIN;

      if (!isConsumer && !isBusiness && !isAdmin) {
        res.status(403).json({ message: 'Not authorized to view this complaint' });
        return;
      }

      res.json(complaintData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

export default router;