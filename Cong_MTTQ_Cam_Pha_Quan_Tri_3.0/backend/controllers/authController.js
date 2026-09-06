const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../config/database');

const crypto = require('crypto');

const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
  }

  db.get('SELECT id, username, password FROM admins WHERE username = ?', [username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    if (row) {
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        const sessionToken = crypto.randomBytes(16).toString('hex');

        db.run('UPDATE admins SET sessionToken = ? WHERE id = ?', [sessionToken, row.id], (updateErr) => {
          if (updateErr) return res.status(500).json({ error: 'Lỗi cập nhật phiên đăng nhập' });

          const token = jwt.sign({ id: row.id, username: row.username, sessionId: sessionToken }, config.jwtSecret, { expiresIn: '8h' });

          res.cookie('jwt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
          });

          res.status(200).json({ message: 'Login successful' });
        });
      } else {
        res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
      }
    } else {
      res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }
  });
};

const logout = (req, res) => {
  res.clearCookie('jwt_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = (req, res) => {
  if (req.user) {
    res.json({ id: req.user.id, username: req.user.username });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = { login, logout, getMe };
