const express = require('express');
const router = express.Router();
const petitionController = require('../controllers/petitionController');
const { petitionLimiter } = require('../middlewares/rateLimit');
const { checkDuplicatePetition } = require('../middlewares/validate');
const upload = require('../config/upload');
const { virusScanMiddleware } = require('../middlewares/virusScan');
const multer = require('multer');

// Public route to submit a petition
router.post('/', petitionLimiter, (req, res, next) => {
  const uploadMiddleware = upload.array('images', 20); // 20 images max
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Lỗi tải ảnh: Số lượng hoặc dung lượng ảnh vượt quá giới hạn cho phép.' });
    } else if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: err.message || 'Đã xảy ra lỗi không xác định khi tải ảnh.' });
    }
    
    // Proceed to virus scan
    virusScanMiddleware(req, res, next);
  });
}, checkDuplicatePetition, petitionController.createPetition);

// Public route to get petitions
router.get('/', petitionController.getPublicPetitions);

// Public route to track petition
router.get('/track/:code', petitionController.trackPetition);

module.exports = router;
