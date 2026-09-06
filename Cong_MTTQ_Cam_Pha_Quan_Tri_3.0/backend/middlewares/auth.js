const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Truy cập bị từ chối. Vui lòng đăng nhập.' });

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
    
    // Check if session matches
    const db = require('../config/database');
    db.get('SELECT sessionToken FROM admins WHERE id = ?', [user.id], (dbErr, row) => {
      if (dbErr || !row) {
        return res.status(401).json({ error: 'Không thể xác thực phiên đăng nhập.' });
      }
      
      if (row.sessionToken !== user.sessionId) {
        return res.status(401).json({ error: 'Tài khoản đã được đăng nhập trên một thiết bị khác. Vui lòng đăng nhập lại.' });
      }
      
      req.user = user;
      next();
    });
  });
};

module.exports = authenticateToken;
