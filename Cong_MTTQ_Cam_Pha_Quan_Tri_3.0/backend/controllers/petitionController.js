const petitionService = require('../services/petitionService');
const asyncHandler = require('../middlewares/asyncHandler');

const createPetition = asyncHandler(async (req, res) => {
  const files = req.files;
  const imagePaths = files ? files.map(file => file.filename).join(',') : '';

  const petitionData = {
    ...req.body,
    imagePaths
  };

  try {
    const trackingCode = await petitionService.queueNewPetition(petitionData);
    res.status(201).json({ message: 'Petition queued successfully.', trackingCode });
  } catch (err) {
    console.error('Failed to queue petition:', err);
    res.status(500).json({ error: 'Hệ thống đang quá tải hoặc lỗi kết nối hàng đợi. Vui lòng thử lại sau.' });
  }
});

const getPublicPetitions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await petitionService.getPublicPetitions(page, limit);
  res.status(200).json(result);
});

const trackPetition = asyncHandler(async (req, res) => {
  const code = req.params.code;
  
  try {
    const petition = await petitionService.trackPetition(code);
    res.status(200).json(petition);
  } catch (error) {
    if (error.message === 'Không tìm thấy mã tra cứu này.') {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
});

module.exports = {
  createPetition,
  getPublicPetitions,
  trackPetition
};
