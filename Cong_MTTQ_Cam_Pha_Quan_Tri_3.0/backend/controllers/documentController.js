const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const getPublicDocuments = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let query = 'SELECT id, title, documentNumber, issueDate, content, fileUrl, createdAt FROM documents';
  let countQuery = 'SELECT COUNT(*) as count FROM documents';
  let params = [];
  let countParams = [];

  if (search) {
    query += ' WHERE title LIKE ? OR documentNumber LIKE ?';
    countQuery += ' WHERE title LIKE ? OR documentNumber LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY issueDate DESC, id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.get(countQuery, countParams, (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi đếm số lượng văn bản' });
    const total = row.count;

    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách văn bản' });
      res.status(200).json({ data: rows, total });
    });
  });
};

const getAdminDocuments = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let query = 'SELECT id, title, documentNumber, issueDate, content, fileUrl, createdAt FROM documents';
  let countQuery = 'SELECT COUNT(*) as count FROM documents';
  let params = [];
  let countParams = [];

  if (search) {
    query += ' WHERE title LIKE ? OR documentNumber LIKE ?';
    countQuery += ' WHERE title LIKE ? OR documentNumber LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY issueDate DESC, id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.get(countQuery, countParams, (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    const total = row.count;

    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
      res.status(200).json({ data: rows, total });
    });
  });
};

const createDocument = (req, res) => {
  const { title, documentNumber, issueDate, content } = req.body;
  let fileUrls = [];

  if (req.files && req.files.length > 0) {
    fileUrls = req.files.map(file => `/uploads/.quarantine/${file.filename}`);
  }

  if (!title) {
    return res.status(400).json({ error: 'Tiêu đề/Trích yếu là bắt buộc' });
  }

  const query = `
    INSERT INTO documents (title, documentNumber, issueDate, content, fileUrl)
    VALUES (?, ?, ?, ?, ?)
  `;
  const fileUrlStr = fileUrls.length > 0 ? JSON.stringify(fileUrls) : null;
  const params = [title, documentNumber, issueDate, content, fileUrlStr];

  db.run(query, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi khi thêm văn bản' });
    }
    res.status(201).json({ message: 'Thêm văn bản thành công', id: this.lastID });
  });
};

const updateDocument = (req, res) => {
  const { id } = req.params;
  const { title, documentNumber, issueDate, content, remainingFiles } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Tiêu đề/Trích yếu là bắt buộc' });
  }

  db.get('SELECT fileUrl FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });

    let existingFileUrls = [];
    if (row && row.fileUrl) {
      try {
        existingFileUrls = JSON.parse(row.fileUrl);
      } catch (e) {
        existingFileUrls = [row.fileUrl]; // Fallback for old single string data
      }
    }

    let keptFiles = [];
    if (remainingFiles) {
      try {
        keptFiles = JSON.parse(remainingFiles);
      } catch(e) {
        if (typeof remainingFiles === 'string') keptFiles = [remainingFiles];
      }
    }

    // Delete physically removed files
    const filesToDelete = existingFileUrls.filter(url => !keptFiles.includes(url));
    filesToDelete.forEach(url => {
      const filePath = path.join(__dirname, '..', url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Add new files
    let newFileUrls = [];
    if (req.files && req.files.length > 0) {
      newFileUrls = req.files.map(file => `/uploads/.quarantine/${file.filename}`);
    }

    const finalFileUrls = [...keptFiles, ...newFileUrls];
    const fileUrlStr = finalFileUrls.length > 0 ? JSON.stringify(finalFileUrls) : null;

    const query = `UPDATE documents SET title = ?, documentNumber = ?, issueDate = ?, content = ?, fileUrl = ? WHERE id = ?`;
    const params = [title, documentNumber, issueDate, content, fileUrlStr, id];

    db.run(query, params, function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật văn bản' });
      res.status(200).json({ message: 'Cập nhật thành công' });
    });
  });
};

const deleteDocument = (req, res) => {
  const { id } = req.params;

  db.get('SELECT fileUrl FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    if (!row) return res.status(404).json({ error: 'Không tìm thấy văn bản' });

    if (row.fileUrl) {
      let fileUrls = [];
      try {
        fileUrls = JSON.parse(row.fileUrl);
      } catch(e) {
        fileUrls = [row.fileUrl]; // Fallback
      }
      fileUrls.forEach(url => {
        const filePath = path.join(__dirname, '..', url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    db.run('DELETE FROM documents WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi khi xóa văn bản' });
      res.status(200).json({ message: 'Đã xóa văn bản' });
    });
  });
};

module.exports = {
  getPublicDocuments,
  getAdminDocuments,
  createDocument,
  updateDocument,
  deleteDocument
};
