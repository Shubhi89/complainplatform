import express, { Request, Response } from 'express';

const router = express.Router();

// @route   POST /api/admin/verify-secret
// @desc    Validate the admin's secret code
// @access  Protected (User must be logged in as ADMIN)
router.post('/verify-secret', (req: Request, res: Response) => {
  const { secret } = req.body;
  
  // 1. Get the correct code from .env
  const correctCode = process.env.ADMIN_SECRET_CODE;

  // 2. Compare inputs
  if (!secret || secret !== correctCode) {
    return res.status(401).json({ success: false, message: 'Invalid Secret Code' });
  }

  // 3. Success! Update the session
  if (req.session) {
    req.session.isSecretVerified = true;
  }

  res.json({ success: true, message: 'Admin access granted' });
});

export default router;