const Joi = require('joi');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
console.log('JWT_SECRET:', JWT_SECRET);


const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(6) // Minimum length of 6 characters
        .pattern(/^[a-z]+$/) // Ensure only lowercase letters
        .messages({
            'string.pattern.base': 'Password needs to be lowercase', 
            'string.min': 'Password must be at least 6 characters long' 
        })
        .required()
});

const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});


const signUp = async (req, res) => {
    const { error } = signUpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const existingUserName = await User.findOne({ username });
        if (existingUserName) {
            return res.status(400).json({ message: 'Username already exists' })
        }

        const newUser = new User({username, email, password});
        await newUser.save();

        res.status(202).json({message: 'User successfully created', newUser});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // ✅ Secure Cookie Settings
        res.cookie("token", token, {
            httpOnly: true,  // 🔥 Prevents JavaScript access (security)
            secure: true,  // 🔥 Must be `true` for HTTPS (Railway uses HTTPS)
            sameSite: "None", // 🔥 Allows cross-origin cookies (Vercel → Railway)
            path: "/", // ✅ Ensure cookie is available for all requests
            maxAge: 3600000, // ✅ 1 hour expiration
        });

        res.status(200).json({ message: 'Sign-in successful' });
    } catch (error) {
        console.error('Error in signIn:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    console.log("🔍 Request Headers:", req.headers); // ✅ Debug Authorization header
    console.log("🔍 Cookies Received:", req.cookies); // 

    try {
        const user = await User.findById(req.user.userId)
        .select('-password')
        .populate({
            path: 'transactions',
            model: 'Transaction',    
        });

        console.log("Fetched User:", user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const logOut = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,  // ✅ Ensure HTTPS compatibility
        sameSite: "None",  // ✅ Fix cross-origin issues
        path: "/",  // ✅ Ensure it's cleared for all requests
    });
    res.status(200).json({ message: "Logout successful" });
}


module.exports = {
    signUp,
    signIn,
    logOut,
    getCurrentUser
};