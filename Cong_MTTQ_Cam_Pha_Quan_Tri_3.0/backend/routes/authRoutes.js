const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimit');
const authenticateToken = require('../middlewares/auth');
const { loginValidator } = require('../validators/authValidator');
const { validateRequest } = require('../middlewares/validateRequest');

router.post('/login', loginLimiter, loginValidator, validateRequest, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
