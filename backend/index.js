require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const transactionRoute = require('./routes/transactionRoutes');
const upcomingPaymentRoute = require('./routes/paymentRoute');
const budgetRoute = require('./routes/budgetRoutes'); 
const recurringRoute = require('./routes/recurringRoutes');
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
        origin: [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://finance-tracker-frontend-five-eta.vercel.app",
            "https://finance-tracker-frontend-git-main-brainscollides-projects.vercel.app",
            "https://finance-tracker-frontend-leokeco0r-brainscollides-projects.vercel.app"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ Ensure Cookies & Headers Are Sent in Every Response
app.options("*", cors());

// Routes
app.use('/transactions', transactionRoute);
app.use('/payments', upcomingPaymentRoute);
app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use ('/budgets', budgetRoute);
app.use('/recurring', recurringRoute);

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