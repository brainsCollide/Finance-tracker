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

app.use(express.json());
app.use(cookieParser()); // ✅ Load cookies before CORS

app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:5173',
                'http://192.168.1.100:5173',
                'http://localhost:3000',
                'https://finance-tracker-app-beige.vercel.app',
                'https://dashboard-production-fd39.up.railway.app'
            ];

            const isVercel = origin?.endsWith('.vercel.app');
            if (!origin || allowedOrigins.includes(origin) || isVercel) {
                callback(null, true);
            } else {
                callback(new Error("❌ CORS not allowed"));
            }
        },
        credentials: true, // ✅ Allow cookies and authentication headers
    })
);


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
