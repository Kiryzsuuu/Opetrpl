const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Login routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Register routes
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Forgot / Reset password
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Logout
router.get('/logout', authController.logout);

// Dashboard
router.get('/dashboard', isAuthenticated, authController.dashboard);

// Redirect root ke login atau dashboard
router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
