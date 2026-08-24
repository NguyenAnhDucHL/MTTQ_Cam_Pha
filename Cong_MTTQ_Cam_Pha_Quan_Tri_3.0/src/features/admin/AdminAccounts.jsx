import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Shield, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';

export function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // TODO: Thêm API xóa tài khoản sau (nếu cần)
      setAccounts(accounts.filter(acc => acc.id !== id));
      toast.success('Đã xóa tài khoản thành công');
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Danh sách tài khoản</h3>
          <p className="text-sm text-gray-500 mt-1">Quản lý người dùng và phân quyền hệ thống</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto shadow-sm">
          + Thêm tài khoản
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium border-b border-gray-100">Người dùng</th>
              <th className="p-4 font-medium border-b border-gray-100">Vai trò</th>
              <th className="p-4 font-medium border-b border-gray-100">Trạng thái</th>
              <th className="p-4 font-medium border-b border-gray-100 hidden sm:table-cell">Đăng nhập lần cuối</th>
              <th className="p-4 font-medium border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Không có dữ liệu tài khoản
                </td>
              </tr>
            ) : (
              accounts.map(account => (
                <tr key={account.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
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
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className={account.role === 'admin' ? 'text-red-500' : 'text-blue-500'} />
                      <span className={`text-sm font-medium ${account.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                        {account.role === 'admin' ? 'Quản trị viên' : 'Cán bộ'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${account.status === 'active'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                      {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 hidden sm:table-cell">
                    {account.lastLogin}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
