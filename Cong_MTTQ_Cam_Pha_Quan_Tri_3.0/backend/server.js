const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');

const config = require('./config/config');
const apiRoutes = require('./routes/index');

const app = express();

// Trust proxy if running behind Nginx
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

app.use(cors());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against XSS
app.use(xssClean());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api', apiRoutes);

app.listen(config.port, () => {
  console.log(`Backend server running at http://localhost:${config.port}`);
});
