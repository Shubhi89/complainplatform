import express from 'express';
import passport from 'passport';

const router = express.Router();

// @route   GET /auth/google
// @desc    Start Google Login flow
// @access  Public
// @param   role (optional query param: 'BUSINESS' or 'CONSUMER')
router.get('/google', (req, res, next) => {
  const role = req.query.role as string || 'CONSUMER'; // Default to Consumer
  
  // Pass the role as the 'state' to Google
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role 
  })(req, res, next);
});

// @route   GET /auth/google/callback
// @desc    Google calls this after login
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    // In a real app, we redirect to the frontend dashboard
    // For now, we redirect to a JSON viewer to see if it worked
    res.redirect('/api/current_user');
  }
);

// @route   GET /api/current_user
// @desc    Get the currently logged in user
router.get('/api/current_user', (req, res) => {
  res.send(req.user);
});

// @route   GET /api/logout
// @desc    Log out user
router.get('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;