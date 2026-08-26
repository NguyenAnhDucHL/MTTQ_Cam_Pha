const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const hpp = require('hpp');

const config = require('./config/config');
const apiRoutes = require('./routes/index');

// Initialize Queue and Worker
require('./config/queue');

const app = express();

// Trust proxy if running behind Nginx
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

app.use(cors());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));



// Prevent HTTP Parameter Pollution
app.use(hpp());

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Lỗi hệ thống không xác định',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(config.port, () => {
  console.log(`Backend server running at http://localhost:${config.port}`);
});
