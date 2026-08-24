const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const getAdminPetitions = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status || 'all';
  const search = req.query.search || '';

  let whereClause = '1=1';
  let params = [];

  if (status !== 'all') {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    whereClause += ' AND (title LIKE ? OR phone LIKE ? OR trackingCode LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  db.get(`SELECT COUNT(*) as total FROM petitions WHERE ${whereClause}`, params, (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve count.' });

    const sql = `SELECT id, fullName, phone, cccd, ward, address, title, category, content, imagePaths, status, createdAt, trackingCode, adminNotes 
                 FROM petitions WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;

    db.all(sql, [...params, limit, offset], (err2, rows) => {
      if (err2) return res.status(500).json({ error: 'Failed to retrieve petitions.' });
      res.status(200).json({
        data: rows,
        total: row.total,
        page,
        limit
      });
    });
  });
};

const getStats = (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM petitions
  `, [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve stats.' });
    res.status(200).json(row);
  });
};

const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const adminName = req.user.username || 'Admin';

  db.run('UPDATE petitions SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update status.' });

    const logAction = `Cập nhật trạng thái thành: ${status}`;
    db.run('INSERT INTO tracking_logs (petitionId, action, notes) VALUES (?, ?, ?)', [id, logAction, `Thực hiện bởi: ${adminName}. ${notes || ''}`], (err2) => {
      if (err2) console.error('Failed to save log', err2);
      res.status(200).json({ message: 'Status updated successfully.' });
    });
  });
};

const updateNotes = (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  db.run('UPDATE petitions SET adminNotes = ? WHERE id = ?', [notes, id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update notes.' });
    res.status(200).json({ message: 'Notes updated successfully.' });
  });
};

const deletePetition = (req, res) => {
  const { id } = req.params;
  db.get('SELECT imagePaths FROM petitions WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi cơ sở dữ liệu' });
    if (!row) return res.status(404).json({ error: 'Không tìm thấy phản ánh' });

    db.run('DELETE FROM petitions WHERE id = ?', [id], function (err2) {
      if (err2) return res.status(500).json({ error: 'Không thể xóa phản ánh' });

      db.run('DELETE FROM tracking_logs WHERE petitionId = ?', [id]);

      if (row.imagePaths) {
        const images = row.imagePaths.split(',');
        images.forEach(img => {
          const imgPath = path.join(__dirname, '..', 'uploads', img);
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        });
      }
      res.status(200).json({ message: 'Xóa thành công' });
    });
  });
};

module.exports = {
  getAdminPetitions,
  getStats,
  updateStatus,
  updateNotes,
  deletePetition
};
