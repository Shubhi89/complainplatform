import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// @route   GET /auth/google
// @desc    Start Google Login flow
// @access  Public
// @param   role (optional query param: 'BUSINESS' or 'CONSUMER')
router.get('/google', (req, res, next) => {
  const role = req.query.role as string || 'CONSUMER'; // Default to Consumer
  if (req.session) {
    (req.session as any).tempRole = role;
    req.session.save(); // Force save to be safe
  }
  // Pass the role as the 'state' to Google
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role 
  })(req, res, next);
});

// @route   GET /auth/google/callback
// @desc    Google calls this after login
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // 1. Get the user from the request
    const user = req.user as any;

    // 2. Generate the Token DIRECTLY here (Fixes the "not a function" error)
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // 3. Redirect to Frontend with token
    res.redirect(`http://localhost:5173/google-callback?token=${token}`);
  }
);

// @route   GET /api/current_user
// @desc    Get the currently logged in user
router.get('/current_user', (req, res) => {
  res.send(req.user);
});

// @route   GET /api/logout
// @desc    Log out user
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;