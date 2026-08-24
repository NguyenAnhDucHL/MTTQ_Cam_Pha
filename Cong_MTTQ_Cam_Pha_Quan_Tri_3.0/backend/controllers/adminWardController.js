const db = require('../config/database');

const createWard = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên khu phố' });

  db.run('INSERT INTO wards (name) VALUES (?)', [name], function (err) {
    if (err) return res.status(500).json({ error: 'Khu phố đã tồn tại hoặc lỗi hệ thống' });
    res.status(201).json({ id: this.lastID, name });
  });
};

const getWards = (req, res) => {
  db.all('SELECT id, name FROM wards ORDER BY name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    res.status(200).json(rows);
  });
};

const updateWard = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên khu phố' });

  db.run('UPDATE wards SET name = ? WHERE id = ?', [name, id], function (err) {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    res.status(200).json({ message: 'Cập nhật thành công' });
  });
};

const deleteWard = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM wards WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    res.status(200).json({ message: 'Xóa thành công' });
  });
};

module.exports = {
  createWard,
  getWards,
  updateWard,
  deleteWard
};
