const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');

const config = require('./config/config');
const apiRoutes = require('./routes/index');

// Initialize Queue and Worker
require('./config/queue');

// Initialize Backup Service
require('./services/backupService');

const app = express();

// Trust proxy if running behind Nginx
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

app.use(cors({
  origin: true, // Allow any origin but specifically reflect it for credentials
  credentials: true,
}));

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));



// Prevent HTTP Parameter Pollution
app.use(hpp());

// Static files (uploaded images) with 1 year cache
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  immutable: true
}));

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
