import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';

export function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentAccount, setCurrentAccount] = useState({ id: null, username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/mttq-api/admin/accounts');
      setAccounts(data);
    } catch (error) {
      toast.error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleDelete = async (id, name) => {
    if (name === 'admin') {
      toast.error('Không thể xóa tài khoản quản trị gốc!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;

    try {
      await fetchApi(`/mttq-api/admin/accounts/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa tài khoản thành công');
      loadAccounts();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentAccount({ id: null, username: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (account) => {
    if (account.username === 'admin') {
      toast.error('Không thể sửa đổi tài khoản quản trị gốc từ giao diện này!');
      return;
    }
    setModalMode('edit');
    setCurrentAccount({ id: account.id, username: account.username, password: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAccount.username.trim()) {
      toast.error('Tên đăng nhập không được để trống');
      return;
    }
    if (modalMode === 'add' && !currentAccount.password) {
      toast.error('Mật khẩu không được để trống');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'add') {
        await fetchApi('/mttq-api/admin/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentAccount.username, password: currentAccount.password })
        });
        toast.success('Thêm tài khoản thành công');
      } else {
        await fetchApi(`/mttq-api/admin/accounts/${currentAccount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentAccount.username, password: currentAccount.password })
        });
        toast.success('Cập nhật tài khoản thành công');
      }
      setIsModalOpen(false);
      loadAccounts();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 relative">
      <div className="font-bold text-lg text-slate-800 mb-5 pb-3 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2.5">
        <span>Danh sách Tài khoản</span>
        <button
          onClick={openAddModal}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold rounded-md border-none cursor-pointer w-auto px-4 py-2 text-[0.9rem]"
        >
          + Thêm tài khoản
        </button>
      </div>

      <div className="overflow-x-auto mt-2.5">
        <table className="w-full border-collapse text-[0.95rem]">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="p-3 text-left font-semibold text-slate-500">Người dùng</th>
              <th className="p-3 text-left font-semibold text-slate-500">Vai trò</th>
              <th className="p-3 text-left font-semibold text-slate-500">Trạng thái</th>
              <th className="p-3 text-right font-semibold text-slate-500 w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  Không có dữ liệu tài khoản
                </td>
              </tr>
            ) : (
              accounts.map(account => (
                <tr key={account.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{account.username}</div>
                  </td>
                  <td className="p-3">
                    <span className={`font-semibold text-[0.85rem] ${account.username === 'admin' ? 'text-red-600' : 'text-blue-500'}`}>
                      {account.username === 'admin' ? 'Quản trị viên' : 'Cán bộ'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[0.8rem] font-semibold">
                      Hoạt động
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="inline-flex gap-1.5">
                      <button
                        onClick={() => openEditModal(account)}
                        title="Sửa mật khẩu"
                        className="bg-transparent border-none cursor-pointer text-[1.1rem] px-1.5 py-1 rounded hover:bg-amber-100"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(account.id, account.username)}
                        title="Xóa"
                        className="bg-transparent border-none cursor-pointer text-[1.1rem] px-1.5 py-1 rounded hover:bg-red-100"
                      >
                        🗑️
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-5">
          <div className="bg-white rounded-lg w-full max-w-[400px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="m-0 text-[1.1rem] text-slate-900">
                {modalMode === 'add' ? 'Thêm tài khoản mới' : 'Chỉnh sửa tài khoản'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-transparent border-none text-[1.2rem] cursor-pointer text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-[0.9rem] font-semibold text-slate-700">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={currentAccount.username}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, username: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full box-border"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div>
                <label className="block mb-2 text-[0.9rem] font-semibold text-slate-700">
                  Mật khẩu {modalMode === 'edit' && <span className="font-normal text-slate-400">(Bỏ trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  value={currentAccount.password}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, password: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full box-border"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div className="mt-2.5 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md cursor-pointer font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-green-700 text-white font-semibold rounded-md border-none px-4 py-2 w-auto ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-800 cursor-pointer'}`}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
