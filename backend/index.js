require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const transactionRoutes = require('./routes/transactionRoutes');
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

const allowedOrigins = [
    'http://localhost:5173',  // ✅ Local frontend
    /\.vercel\.app$/,         // ✅ Allow all Vercel subdomains
    /\.railway\.app$/,        // ✅ Allow all Railway subdomains
    'https://finance-tracker-app-beige.vercel.app', // ✅ Specific frontend URL (if applicable)
];

// CORS Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            console.log('🔍 Request Origin:', origin);
            if (!origin || allowedOrigins.some((allowedOrigin) => {
                if (typeof allowedOrigin === 'string') {
                    return origin === allowedOrigin;
                } else if (allowedOrigin instanceof RegExp) {
                    return allowedOrigin.test(origin);
                }
                return false;
            })) {
                callback(null, true);
            } else {
                callback(new Error('❌ Not allowed by CORS'));
            }
        },
        credentials: true, // ✅ Allow cookies and authentication headers
    })
);

// Other Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/transactions', transactionRoutes);
app.use('/auth', authRoute);
app.use('/users', userRoute);

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const code = err.code || 500;
    res.status(code).json({ message: err.message });
});

// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
