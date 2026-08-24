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

  const handleDelete = async (id, name) => {
    if (name === 'admin') {
      toast.error('Không thể xóa tài khoản quản trị gốc!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    
    try {
      await fetchApi(`/api/admin/accounts/${id}`, { method: 'DELETE' });
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
    if (account.name === 'admin') {
      toast.error('Không thể sửa đổi tài khoản quản trị gốc từ giao diện này!');
      return;
    }
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
    <div className="card" style={{ position: 'relative' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span>Danh sách Tài khoản</span>
        <button 
          onClick={openAddModal}
          className="btn-submit" 
          style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}
        >
          + Thêm tài khoản
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Người dùng</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Vai trò</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Trạng thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', width: '100px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Không có dữ liệu tài khoản
                </td>
              </tr>
            ) : (
              accounts.map(account => (
                <tr key={account.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>{account.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{account.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      color: account.role === 'admin' ? 'var(--primary-red)' : '#3b82f6',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      {account.role === 'admin' ? 'Quản trị viên' : 'Cán bộ'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      background: account.status === 'active' ? '#dcfce7' : '#f1f5f9',
                      color: account.status === 'active' ? '#166534' : '#475569',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(account)}
                        title="Sửa"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 6px', borderRadius: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(account.id, account.name)}
                        title="Xóa"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 6px', borderRadius: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                {modalMode === 'add' ? 'Thêm tài khoản mới' : 'Chỉnh sửa tài khoản'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={currentAccount.username}
                  onChange={(e) => setCurrentAccount({...currentAccount, username: e.target.value})}
                  className="form-control"
                  style={{ width: '100%' }}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                  Mật khẩu {modalMode === 'edit' && <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(Bỏ trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  value={currentAccount.password}
                  onChange={(e) => setCurrentAccount({...currentAccount, password: e.target.value})}
                  className="form-control"
                  style={{ width: '100%' }}
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit"
                  style={{ padding: '8px 16px', width: 'auto', opacity: isSubmitting ? 0.7 : 1 }}
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
