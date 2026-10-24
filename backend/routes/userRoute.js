
const express = require('express');
const {
    getUserById,
} = require('../controller/userController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// User can only access their own profile.
router.get('/:id', authenticate, (req, res, next) => {
    if (String(req.user.userId) !== String(req.params.id)) {
        return res.status(403).json({
            message: 'Forbidden: You cannot access this user',
        });
    }

    return next();
}, getUserById);

module.exports = router;
