const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const petitionRoutes = require('./petitionRoutes');
const adminRoutes = require('./adminRoutes');
const authenticateToken = require('../middlewares/auth');

router.use('/admin', authRoutes); // /api/admin/login
router.use('/petitions', petitionRoutes); // /api/petitions
router.use('/admin', authenticateToken, adminRoutes); // /api/admin/* (protected)

module.exports = router;
