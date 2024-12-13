const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./db/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const app = express();

// Kết nối đến database
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));  // Thư mục để lưu ảnh
app.use(express.static(path.join(__dirname, 'dist')));
// CORS headers
app.use(cors({
    origin: "https://frontend-68nc.onrender.com",
    // origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
    credentials: true  // If you want to allow cookies or authentication headers
}));

// Routes
app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

module.exports = app;
