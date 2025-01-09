const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    console.log('Cookies:', req.cookies);

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);
        req.user = decoded;
        next();
    }

    catch (error) {
        console.error('Token Verification Error:', error.message);
        res.status(401).json({ message: 'Unauthorized' });
    }

};

module.exports = authenticate;