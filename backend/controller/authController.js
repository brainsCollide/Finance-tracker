const Joi = require('joi');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

console.log("✅ JWT_SECRET Loaded");

// ✅ Schema Validation
const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(6)
        .pattern(/^[a-z]+$/) 
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

// ✅ Sign-Up Controller
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

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User successfully created', newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Sign-In Controller
const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // ✅ Generate JWT Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // ✅ Fix: Set Cookies Correctly
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,  // 🔥 Only secure in production
            sameSite: "None", // 🔥 Required for cross-origin requests
            path: "/",
            maxAge: 3600000, // ✅ 1 hour expiration
        });

        res.status(200).json({ message: 'Sign-in successful' });
    } catch (error) {
        console.error('❌ Error in signIn:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Logout Controller
const logOut = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "None",
        path: "/",
    });

    res.status(200).json({ message: "Logout successful" });
};

// ✅ Get Current User Controller
const getCurrentUser = async (req, res) => {
    console.log("🔍 Request Headers:", req.headers);
    console.log("🔍 Cookies Received:", req.cookies);

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "❌ Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password').populate('transactions');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: "❌ Unauthorized: Invalid or expired token", error: error.message });
    }
};

module.exports = {
    signUp,
    logOut,
    signIn,
    getCurrentUser
};