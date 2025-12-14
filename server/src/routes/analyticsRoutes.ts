import express, { Request, Response } from 'express';
import { requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import User from '../models/User';
import Complaint from '../models/Complaint';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Protected (Admin Only - Requires Secret Code)
router.get(
  '/stats',
  requireRole([UserRole.ADMIN]), // Middleware checks for secret code automatically
  async (req: Request, res: Response) => {
    try {
      // Run parallel aggregations using $facet
      const stats = await User.aggregate([
        {
          $facet: {
            // 1. Count Total Users (Consumers)
            totalConsumers: [
              { $match: { role: 'CONSUMER' } },
              { $count: 'count' }
            ],
            // 2. Count Total Businesses
            totalBusinesses: [
              { $match: { role: 'BUSINESS' } },
              { $count: 'count' }
            ],
            // 3. Count Pending Verifications (Business users not yet verified)
            pendingBusinesses: [
              { $match: { role: 'BUSINESS', isVerified: false } },
              { $count: 'count' }
            ]
          }
        }
      ]);

      // Count complaints separately (since it's a different collection)
      const complaintCount = await Complaint.countDocuments();

      // Format the result (MongoDB returns arrays, we want numbers)
      const result = {
        consumers: stats[0].totalConsumers[0]?.count || 0,
        businesses: stats[0].totalBusinesses[0]?.count || 0,
        pending: stats[0].pendingBusinesses[0]?.count || 0,
        totalComplaints: complaintCount
      };

      res.json(result);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

export default router;