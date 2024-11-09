const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./db/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const cron = require('node-cron');
const handle = require('./services/userService')
const app = express();

// Kết nối đến database
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));  // Thư mục để lưu ảnh

// CORS headers
app.use(cors({
    origin: process.env.FE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
    credentials: true  // If you want to allow cookies or authentication headers
}));

cron.schedule('*/15 * * * *', () => {
    console.log('Checking expired requests...');
    handle.checkExpiredRequests();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

module.exports = app;
