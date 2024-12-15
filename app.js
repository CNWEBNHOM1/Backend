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
// CORS headers
const allowedOrigins = ['lmvait2k66.id.vn', 'https://frontend-68nc.onrender.com', 'http://localhost:4444'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Cho phép request nếu origin hợp lệ
        } else {
            callback(new Error('Not allowed by CORS')); // Từ chối các origin không hợp lệ
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức cho phép
    credentials: true, // Cho phép gửi thông tin xác thực
};
app.use(cors(corsOptions));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

module.exports = app;
