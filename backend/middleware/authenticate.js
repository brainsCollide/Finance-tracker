
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const authenticate = (req, res, next) => {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;

    let token = cookieToken || null;

    // Fallback to Authorization: Bearer <token>
    if (!token && authHeader) {
        const match = authHeader.match(/^Bearer\s+(\S+)$/i);

        if (!match) {
            return res.status(401).json({
                message: 'Unauthorized: Invalid authorization format',
            });
        }

        token = match[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized: No token provided',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
        });

        req.user = decoded;

        return next();
    } catch {
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token',
        });
    }
};

module.exports = authenticate;
