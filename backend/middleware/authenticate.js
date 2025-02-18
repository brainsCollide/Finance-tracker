const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const authenticate = (req, res, next) => {
    console.log("🔍 Incoming Request Headers:", req.headers);
    console.log("🔍 Incoming Cookies:", req.cookies);

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "❌ Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ Token Verified:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Token Verification Error:", error.message);
        return res.status(401).json({ message: "❌ Unauthorized: Invalid or expired token" });
    }
};

module.exports = authenticate;
