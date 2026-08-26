const adminPetitionService = require('../services/adminPetitionService');
const asyncHandler = require('../middlewares/asyncHandler');

const getAdminPetitions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || 'all';
  const search = req.query.search || '';

  const result = await adminPetitionService.getAdminPetitions(page, limit, status, search);
  res.status(200).json(result);
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminPetitionService.getStats();
  res.status(200).json(stats);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const adminName = req.user?.username || 'Admin';

  await adminPetitionService.updateStatus(id, status, notes, adminName);
  res.status(200).json({ message: 'Status updated successfully.' });
});

const updateNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  await adminPetitionService.updateNotes(id, notes);
  res.status(200).json({ message: 'Notes updated successfully.' });
});

const deletePetition = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await adminPetitionService.deletePetition(id);
    res.status(200).json({ message: 'Xóa thành công' });
  } catch (error) {
    if (error.message === 'Không tìm thấy phản ánh') {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
});

module.exports = {
  getAdminPetitions,
  getStats,
  updateStatus,
  updateNotes,
  deletePetition
};
