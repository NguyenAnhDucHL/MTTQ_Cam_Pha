const bcrypt = require('bcrypt');
const { getAsync, allAsync, runAsync } = require('../utils/database-promise');

const getAccounts = async () => {
  return await allAsync('SELECT id, username FROM admins ORDER BY id ASC');
};

const createAccount = async (username, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  try {
    const result = await runAsync('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
    return { id: result.lastID, username };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error('Tên đăng nhập đã tồn tại');
    }
    throw err;
  }
};

const updateAccountPassword = async (id, newPassword) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await runAsync('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, id]);
};

const deleteAccount = async (id) => {
  if (id == 1) {
    throw new Error('Không thể xóa tài khoản admin gốc');
  }
  await runAsync('DELETE FROM admins WHERE id = ?', [id]);
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccountPassword,
  deleteAccount
};
