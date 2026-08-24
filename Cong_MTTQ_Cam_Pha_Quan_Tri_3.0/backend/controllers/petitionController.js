const db = require('../config/database');

const createPetition = (req, res) => {
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

  const sql = `INSERT INTO petitions (fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save petition.' });
    } else {
      res.status(201).json({ message: 'Petition saved successfully.', id: this.lastID, trackingCode });
    }
  });
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
