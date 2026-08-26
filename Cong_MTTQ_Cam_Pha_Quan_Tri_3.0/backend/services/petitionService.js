const { getAsync, allAsync } = require('../utils/database-promise');
const { petitionQueue } = require('../config/queue');

const queueNewPetition = async (petitionData) => {
  let { fullName, phone, cccd, ward, address, title, category, content, imagePaths } = petitionData;

  // Basic input sanitization
  fullName = fullName ? fullName.trim() : '';
  title = title ? title.trim() : '';

  // Generate random tracking code
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const trackingCode = `CP-${dateStr}-${randomStr}`;

  // Push the job to the queue
  await petitionQueue.add('new-petition', {
    fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode
  });

  return trackingCode;
};

const getPublicPetitions = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const row = await getAsync('SELECT COUNT(*) as total FROM petitions');
  
  const rows = await allAsync(
    'SELECT id, fullName, title, category, content, imagePaths, status, createdAt FROM petitions ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return {
    data: rows,
    total: row.total,
    page,
    limit
  };
};

const trackPetition = async (trackingCode) => {
  const petition = await getAsync(
    'SELECT id, fullName, phone, cccd, ward, address, title, category, content, imagePaths, status, createdAt, trackingCode, adminNotes FROM petitions WHERE trackingCode = ?',
    [trackingCode]
  );

  if (!petition) {
    throw new Error('Không tìm thấy mã tra cứu này.');
  }

  const logs = await allAsync(
    'SELECT id, action, notes, createdAt FROM tracking_logs WHERE petitionId = ? ORDER BY createdAt DESC',
    [petition.id]
  );

  petition.logs = logs || [];
  return petition;
};

module.exports = {
  queueNewPetition,
  getPublicPetitions,
  trackPetition
};
