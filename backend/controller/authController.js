const Joi = require('joi');
const User = require('../models/User');

const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(6) // Minimum length of 6 characters
        .pattern(/^[a-z]+$/) // Ensure only lowercase letters
        .messages({
            'string.pattern.base': 'Password needs to be lowercase', // Custom message for pattern mismatch
            'string.min': 'Password must be at least 6 characters long' // Optional: Custom message for min length
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
    const { error } = signInSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found'});
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        res.status(200).json({ message: 'Sign-in successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}


module.exports = {
    signUp,
    signIn
};