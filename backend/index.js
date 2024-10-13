const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const transactionRoutes = require('./routes/transactionRoutes');
const connectDB = require('./config/db');

const app = express();

connectDB();


app.use(cors());
app.use(express.json());

app.use('/transactions', transactionRoutes)
app.use('/auth', authRoute);
app.use('/users', userRoute);


app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
