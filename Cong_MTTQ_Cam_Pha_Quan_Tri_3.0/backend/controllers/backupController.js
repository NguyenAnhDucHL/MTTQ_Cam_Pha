const fs = require('fs');
const path = require('path');
const { BACKUP_DIR, performBackup } = require('../services/backupService');

// Lấy danh sách các file backup
const getBackups = (req, res) => {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json([]); // Chưa có thư mục
      }
      return res.status(500).json({ error: 'Không thể đọc thư mục sao lưu' });
    }

    const backups = files
      .filter(file => file.endsWith('.zip'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Mới nhất lên đầu

    res.json(backups);
  });
};

// Tải xuống file backup
const downloadBackup = (req, res) => {
  const { filename } = req.params;
  
  // Ngăn chặn Path Traversal attack (ví dụ: filename = "../../../etc/passwd")
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ error: 'Tên file không hợp lệ' });
  }

  const filePath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Không tìm thấy bản sao lưu này' });
  }

  res.download(filePath, filename);
};

// Tạo backup thủ công ngay lập tức
const createManualBackup = async (req, res) => {
  try {
    const backupPath = await performBackup();
    res.json({ message: 'Tạo bản sao lưu thành công', path: backupPath });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tạo bản sao lưu' });
  }
};

module.exports = {
  getBackups,
  downloadBackup,
  createManualBackup
};
