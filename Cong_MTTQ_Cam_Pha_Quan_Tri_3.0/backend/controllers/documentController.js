const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const getPublicDocuments = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM documents';
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

  let query = 'SELECT * FROM documents';
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
  let fileUrl = null;

  if (req.file) {
    fileUrl = `/uploads/.quarantine/${req.file.filename}`;
  }

  if (!title) {
    return res.status(400).json({ error: 'Tiêu đề/Trích yếu là bắt buộc' });
  }

  const query = `
    INSERT INTO documents (title, documentNumber, issueDate, content, fileUrl)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [title, documentNumber, issueDate, content, fileUrl];

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
  const { title, documentNumber, issueDate, content } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Tiêu đề/Trích yếu là bắt buộc' });
  }

  // Handle optional file update
  let query, params;
  if (req.file) {
    // New file uploaded, need to fetch old file to delete it
    const fileUrl = `/uploads/.quarantine/${req.file.filename}`;
    db.get('SELECT fileUrl FROM documents WHERE id = ?', [id], (err, row) => {
      if (row && row.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', row.fileUrl);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
    });
    query = `UPDATE documents SET title = ?, documentNumber = ?, issueDate = ?, content = ?, fileUrl = ? WHERE id = ?`;
    params = [title, documentNumber, issueDate, content, fileUrl, id];
  } else {
    query = `UPDATE documents SET title = ?, documentNumber = ?, issueDate = ?, content = ? WHERE id = ?`;
    params = [title, documentNumber, issueDate, content, id];
  }

  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật văn bản' });
    if (this.changes === 0) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
    res.status(200).json({ message: 'Cập nhật thành công' });
  });
};

const deleteDocument = (req, res) => {
  const { id } = req.params;

  db.get('SELECT fileUrl FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Lỗi hệ thống' });
    if (!row) return res.status(404).json({ error: 'Không tìm thấy văn bản' });

    if (row.fileUrl) {
      const filePath = path.join(__dirname, '..', row.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
