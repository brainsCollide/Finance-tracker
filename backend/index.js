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
    'http://localhost:5173', // Local frontend
    /\.vercel\.app$/, // Allow all Vercel subdomains
];

// CORS Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            console.log('Request Origin:', origin); // Debug
            if (!origin || allowedOrigins.some(allowedOrigin => {
                if (typeof allowedOrigin === 'string') {
                    return origin === allowedOrigin;
                } else if (allowedOrigin instanceof RegExp) {
                    return allowedOrigin.test(origin);
                }
                return false;
            })) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies and credentials
    })
);

// Handle preflight requests
app.options('*', cors());

// Other Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/transactions', transactionRoutes);
app.use('/auth', authRoute);
app.use('/users', userRoute);

// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});