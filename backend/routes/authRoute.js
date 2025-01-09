const express = require('express');
const { signUp, signIn, logOut, getCurrentUser } = require('../controller/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Routes
router.post('/signup', signUp); // Sign up route
router.post('/signin', signIn); // Sign in route
router.post('/logout', logOut); // Logout route
router.get('/protected', authenticate, (req, res) => {
    res.status(200).json({ message: 'You are authenticated', user: req.user });
}); // Protected route example
router.get('/current', authenticate, getCurrentUser); // Get current user route

module.exports = router;
