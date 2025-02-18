const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const authenticate = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (process.env.NODE_ENV !== 'production') {
            console.log('Cookies:', req.cookies);
            console.log('Token:', token);
            console.log('Decoded Token:', decoded);
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token Verification Error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authenticate;
