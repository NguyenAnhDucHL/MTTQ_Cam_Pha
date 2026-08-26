const adminAccountService = require('../services/adminAccountService');
const asyncHandler = require('../middlewares/asyncHandler');

const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await adminAccountService.getAccounts();
  res.status(200).json(accounts);
});

const createAccount = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    const result = await adminAccountService.createAccount(username, password);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Tên đăng nhập đã tồn tại') {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
});

const updateAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu mới' });
  }

  await adminAccountService.updateAccountPassword(id, password);
  res.status(200).json({ message: 'Cập nhật thành công' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await adminAccountService.deleteAccount(id);
    res.status(200).json({ message: 'Xóa thành công' });
  } catch (error) {
    if (error.message === 'Không thể xóa tài khoản admin gốc') {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
});

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
};
