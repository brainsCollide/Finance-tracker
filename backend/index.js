require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const transactionRoutes = require('./routes/transactionRoutes');
const connectDB = require('./config/db');

const app = express();

connectDB();


app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies)
}));

app.use(express.json());
app.use(cookieParser());

app.use('/transactions', transactionRoutes)
app.use('/auth', authRoute);
app.use('/users', userRoute);


app.listen(5001, () => {
    console.log('Server is running on port 5001');
});
