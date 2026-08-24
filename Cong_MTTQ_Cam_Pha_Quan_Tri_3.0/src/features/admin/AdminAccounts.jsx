import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Shield, Mail, Loader2, X, Plus } from 'lucide-react';
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
      const data = await fetchApi('/api/admin/accounts');
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

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await fetchApi(`/api/admin/accounts/${id}`, { method: 'DELETE' });
        toast.success('Đã xóa tài khoản thành công');
        loadAccounts();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa');
      }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentAccount({ id: null, username: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (account) => {
    setModalMode('edit');
    setCurrentAccount({ id: account.id, username: account.name, password: '' });
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
        await fetchApi('/api/admin/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentAccount.username, password: currentAccount.password })
        });
        toast.success('Thêm tài khoản thành công');
      } else {
        await fetchApi(`/api/admin/accounts/${currentAccount.id}`, {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Danh sách tài khoản</h3>
          <p className="text-sm text-gray-500 mt-1">Quản lý người dùng và phân quyền hệ thống</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm whitespace-nowrap"
        >
          <Plus size={16} /> Thêm tài khoản
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium border-b border-gray-100">Người dùng</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Vai trò</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Trạng thái</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Không có dữ liệu tài khoản
                </td>
              </tr>
            ) : (
              accounts.map(account => (
                <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0 border border-red-100">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{account.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} />
                          {account.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className={account.role === 'admin' ? 'text-red-500' : 'text-blue-500'} />
                      <span className={`text-sm font-medium ${account.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                        {account.role === 'admin' ? 'Quản trị viên' : 'Cán bộ'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${account.status === 'active'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                      {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(account)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" 
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'add' ? 'Thêm tài khoản mới' : 'Chỉnh sửa tài khoản'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={currentAccount.username}
                  onChange={(e) => setCurrentAccount({...currentAccount, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu {modalMode === 'edit' && <span className="text-gray-400 font-normal">(Bỏ trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  value={currentAccount.password}
                  onChange={(e) => setCurrentAccount({...currentAccount, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div className="mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 min-w-[100px]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
