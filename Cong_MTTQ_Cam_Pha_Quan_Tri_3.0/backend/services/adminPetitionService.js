const fs = require('fs');
const path = require('path');
const { getAsync, allAsync, runAsync } = require('../utils/database-promise');

const getAdminPetitions = async (page = 1, limit = 10, status = 'all', search = '') => {
  const offset = (page - 1) * limit;

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

  const countQuery = `SELECT COUNT(*) as total FROM petitions WHERE ${whereClause}`;
  const row = await getAsync(countQuery, params);

  const sql = `SELECT id, fullName, phone, cccd, ward, address, title, category, content, imagePaths, status, createdAt, trackingCode, adminNotes 
               FROM petitions WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;

  const rows = await allAsync(sql, [...params, limit, offset]);

  return {
    data: rows,
    total: row.total,
    page,
    limit
  };
};

const getStats = async () => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM petitions
  `;
  return await getAsync(sql);
};

const updateStatus = async (id, status, notes, adminName) => {
  await runAsync('UPDATE petitions SET status = ? WHERE id = ?', [status, id]);

  const logAction = `Cập nhật trạng thái thành: ${status}`;
  const logNotes = `Thực hiện bởi: ${adminName}. ${notes || ''}`;
  await runAsync('INSERT INTO tracking_logs (petitionId, action, notes) VALUES (?, ?, ?)', [id, logAction, logNotes]);
};

const updateNotes = async (id, notes) => {
  await runAsync('UPDATE petitions SET adminNotes = ? WHERE id = ?', [notes, id]);
};

const deletePetition = async (id) => {
  const row = await getAsync('SELECT imagePaths FROM petitions WHERE id = ?', [id]);
  if (!row) {
    throw new Error('Không tìm thấy phản ánh');
  }

  await runAsync('DELETE FROM petitions WHERE id = ?', [id]);
  await runAsync('DELETE FROM tracking_logs WHERE petitionId = ?', [id]);

  if (row.imagePaths) {
    const images = row.imagePaths.split(',');
    images.forEach(img => {
      const imgPath = path.join(__dirname, '..', 'uploads', img);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
  }
};

module.exports = {
  getAdminPetitions,
  getStats,
  updateStatus,
  updateNotes,
  deletePetition
};
