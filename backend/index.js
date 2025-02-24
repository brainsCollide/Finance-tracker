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
        origin: ["https://finance-tracker-nine-rosy.vercel.app",
            "http://localhost:5173"
        ], // ✅ Replace with your frontend URL
        credentials: true, // ✅ Allows cookies & authentication headers
        methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Explicitly allow methods
        allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure correct headers are allowed
    })
);

// ✅ Ensure Cookies & Headers Are Sent in Every Response
app.options("*", cors());

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