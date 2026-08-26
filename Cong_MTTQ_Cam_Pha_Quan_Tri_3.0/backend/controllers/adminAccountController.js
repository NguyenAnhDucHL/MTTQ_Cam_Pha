const db = require('../config/database');
const bcrypt = require('bcrypt');

const getAccounts = (req, res) => {
  db.all('SELECT id, username FROM admins ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    res.status(200).json(rows);
  });
};

const createAccount = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }
        return res.status(500).json({ error: 'Lỗi hệ thống' });
      }
      res.status(201).json({ id: this.lastID, username });
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi mã hóa mật khẩu' });
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: 'Vui lòng nhập mật khẩu mới' });

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, id], function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
      res.status(200).json({ message: 'Cập nhật thành công' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi mã hóa mật khẩu' });
  }
};

const deleteAccount = (req, res) => {
  const { id } = req.params;
  if (id == 1) return res.status(400).json({ error: 'Không thể xóa tài khoản admin gốc' });

  db.run('DELETE FROM admins WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    res.status(200).json({ message: 'Xóa thành công' });
  });
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
};
