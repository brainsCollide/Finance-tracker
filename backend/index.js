require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const transactionRoutes = require('./routes/transactionRoutes');
const connectDB = require('./config/db');

const app = express();

// ✅ Connect to DB
connectDB();

// ✅ Middleware Configuration
app.use(express.json());
app.use(cookieParser()); // ✅ Ensure cookies are parsed

// ✅ Fixed CORS Configuration
app.use(
    cors({
        origin: "https://finance-tracker-nine-rosy.vercel.app", // ✅ Replace with your frontend URL
        credentials: true, // ✅ Allows cookies & authentication headers
        methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Explicitly allow methods
        allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure correct headers are allowed
    })
);

// ✅ Ensure Cookies & Headers Are Sent in Every Response
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://finance-tracker-nine-rosy.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Routes
app.use('/transactions', transactionRoutes);
app.use('/auth', authRoute);
app.use('/users', userRoute);

// ✅ Fix: Improved Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const code = err.status || 500;
    res.status(code).json({ message: err.message });
});


// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});