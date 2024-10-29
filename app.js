const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./db/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Kết nối đến database
dbConnect();

// Middleware
app.use(express.json());

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
