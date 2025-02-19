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
    'http://localhost:5173', // ✅ Local frontend
    'http://192.168.1.100:5173', // ✅ Network frontend
    'http://localhost:3000', // ✅ Local frontend
    'https://finance-tracker-app-brainscollide-brainscollides-projects.vercel.app', // ✅ Your Vercel frontend
    'https://dashboard-production-fd39.up.railway.app'
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("❌ CORS not allowed"));
            }
        },
        credentials: true, // ✅ This allows cookies to be sent
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Allow all HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], //  // ✅ Allows cookies and authentication headers
    })
);

// Other Middleware
app.use(cookieParser());
app.use(express.json());

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
