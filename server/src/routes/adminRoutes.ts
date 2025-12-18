import express, { Request, Response, NextFunction } from "express";
import { requireRole } from "../middleware/authMiddleware";
import { UserRole } from "../models/User";
import BusinessProfile, { VerificationStatus } from "../models/BusinessProfile";
import User from "../models/User";

const router = express.Router();

// --- MIDDLEWARE---
const requireSecret = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !(req.session as any).isSecretVerified) {
    return res.status(403).json({
      message: "Admin Secret Required",
      requiresSecret: true,
    });
  }
  next();
};

router.post(
  "/verify-secret",
  requireRole([UserRole.ADMIN]),
  (req: Request, res: Response) => {
    const { secret } = req.body;
    const correctCode = process.env.ADMIN_SECRET_CODE;

    if (!secret || secret !== correctCode) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Secret Code" });
    }

    if (req.session) {
      (req.session as any).isSecretVerified = true;
      req.session.save();
    }

    res.json({ success: true, message: "Admin access granted" });
  }
);

// DATA ROUTES (Protected by requireSecret)

router.get(
  "/pending-verifications",
  requireRole([UserRole.ADMIN]),
  requireSecret,
  async (req: Request, res: Response) => {
    try {
      const pending = await BusinessProfile.find({
        status: VerificationStatus.PENDING,
      }).populate("user", "email displayName");
      res.json(pending);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.post(
  "/approve-business",
  requireRole([UserRole.ADMIN]),
  requireSecret,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { profileId, action, reason } = req.body;

      if (!["APPROVED", "REJECTED"].includes(action)) {
        res.status(400).json({ message: "Invalid action" });
        return;
      }

      const profile = await BusinessProfile.findById(profileId);
      if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }

      profile.status = action;
      if (action === "REJECTED") {
        profile.rejectionReason = reason;
      }
      await profile.save();

      if (action === "APPROVED") {
        await User.findByIdAndUpdate(profile.user, { isVerified: true });
      }

      res.json({ success: true, message: `Business ${action}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.get(
  "/stats",
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const totalUsers = await User.countDocuments({ role: UserRole.CONSUMER });

      const totalBusinesses = await User.countDocuments({
        role: UserRole.BUSINESS,
      });

      const verifiedBusinesses = await BusinessProfile.countDocuments({
        status: "APPROVED",
      });

      const pendingVerifications = await BusinessProfile.countDocuments({
        status: "PENDING",
      });

      res.json({
        totalUsers,
        totalBusinesses,
        verifiedBusinesses,
        pendingVerifications,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

export default router;
