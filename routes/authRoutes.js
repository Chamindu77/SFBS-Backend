const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');


// Register a new user
router.post('/register', register);

// Log in a user
router.post('/login', login);


// Route to initiate Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

const jwt = require('jsonwebtoken');

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user;


    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10, // Token expires in 10 hours
    };

    // Sign the token
    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        console.error('Error generating JWT:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      // Redirect to the frontend with the token
      res.redirect(`https://sfbs-frontend.vercel.app/auth/google/callback?token=${token}`);
    });
  }
);

// Route to logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
