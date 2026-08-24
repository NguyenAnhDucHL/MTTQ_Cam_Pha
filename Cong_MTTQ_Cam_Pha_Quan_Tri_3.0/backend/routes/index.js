const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const petitionRoutes = require('./petitionRoutes');
const adminRoutes = require('./adminRoutes');
const authenticateToken = require('../middlewares/auth');
const adminWardController = require('../controllers/adminWardController');

router.use('/admin', authRoutes); // /api/admin/login
router.use('/petitions', petitionRoutes); // /api/petitions
router.get('/wards', adminWardController.getWards); // /api/wards (public)
router.use('/admin', authenticateToken, adminRoutes); // /api/admin/* (protected)

module.exports = router;
