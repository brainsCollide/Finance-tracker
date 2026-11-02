
const mongoose = require('mongoose');
const User = require('../models/User');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid User ID',
            });
        }

        // Defense in depth: users can only access their own profile.
        if (String(req.user?.userId) !== String(id)) {
            return res.status(403).json({
                message: 'Forbidden: You cannot access this user',
            });
        }

        const user = await User.findById(id)
            .select('email username createdAt')
            .lean();

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        return res.json({
            _id: user._id,
            email: user.email,
            username: user.username ?? null,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Failed to fetch user profile:', error.message);

        return res.status(500).json({
            message: 'Internal server error',
        });
    }
};

const updateCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    const allowed = User.schema.path('currency').enumValues;

    if (!allowed.includes(currency)) {
      return res.status(400).json({ message: 'Unsupported currency' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { currency },
      { new: true, runValidators: true }
    )
      .select('currency')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ currency: user.currency });
  } catch (error) {
    console.error('Failed to update currency:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUserById, updateCurrency };