const db = require('../config/database');
const { petitionQueue } = require('../config/queue');

const createPetition = async (req, res) => {
  let { fullName, phone, cccd, ward, address, title, category, content } = req.body;

  // Basic input sanitization (trim spaces)
  fullName = fullName ? fullName.trim() : '';
  title = title ? title.trim() : '';

  const files = req.files;
  const imagePaths = files ? files.map(file => file.filename).join(',') : '';

  // Generate random tracking code
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const trackingCode = `CP-${dateStr}-${randomStr}`;

  try {
    // Push the job to the queue
    await petitionQueue.add('new-petition', {
      fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode
    });

    // Respond immediately, don't wait for SQLite insert
    res.status(201).json({ message: 'Petition queued successfully.', trackingCode });
  } catch (err) {
    console.error('Failed to queue petition:', err);
    res.status(500).json({ error: 'Hệ thống đang quá tải hoặc lỗi kết nối hàng đợi. Vui lòng thử lại sau.' });
  }
};

const getPublicPetitions = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.get('SELECT COUNT(*) as total FROM petitions', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve count.' });

    db.all('SELECT id, fullName, title, category, content, imagePaths, status, createdAt FROM petitions ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset], (err2, rows) => {
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

const trackPetition = (req, res) => {
  const code = req.params.code;
  db.get('SELECT id, fullName, phone, cccd, ward, address, title, category, content, imagePaths, status, createdAt, trackingCode, adminNotes FROM petitions WHERE trackingCode = ?', [code], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve petition.' });
    if (!row) return res.status(404).json({ error: 'Không tìm thấy mã tra cứu này.' });

    // Lấy thêm log
    db.all('SELECT id, action, notes, createdAt FROM tracking_logs WHERE petitionId = ? ORDER BY createdAt DESC', [row.id], (err2, logs) => {
      row.logs = logs || [];
      res.status(200).json(row);
    });
  });
};

module.exports = {
  createPetition,
  getPublicPetitions,
  trackPetition
};
