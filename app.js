const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./db/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
//Upload ảnh
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Kết nối đến database
dbConnect();

// Middleware
app.use(express.json());

app.use(express.static('uploads'));  // Tĩnh để phục vụ file ảnh

// Cấu hình multer cho việc upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file để tránh trùng
    }
});

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/gif' ||
            file.mimetype == 'image/gif' 
        ) {
            cb(null, true)
        }
        else {
            cb(null, false);
            cb(new Error('Only jpeg, jpg, png, and gif Image allow'))
        }
    }
})

// CORS headers
app.use(cors({
    origin: process.env.FE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
    credentials: true  // If you want to allow cookies or authentication headers
}));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

module.exports = app;
