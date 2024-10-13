// routes/userRoute.js
const express = require('express');
const { getUserById, getAllUsers } = require('../controller/userController');
const router = express.Router();

// GET user by ID
router.get('/:id', getUserById);

// GET all users
router.get('/', getAllUsers);

module.exports = router;
