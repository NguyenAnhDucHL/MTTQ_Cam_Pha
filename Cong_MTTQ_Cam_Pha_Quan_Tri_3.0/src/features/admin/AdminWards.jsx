import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';

const ITEMS_PER_PAGE = 10;

export function AdminWards() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWardName, setNewWardName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadWards = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/mttq-api/wards');
      setWards(data);
    } catch (error) {
      toast.error('Không thể tải danh sách khu phố');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWardName.trim()) {
      toast.error('Vui lòng nhập tên khu phố');
      return;
    }
    try {
      await fetchApi('/mttq-api/admin/wards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWardName.trim() })
      });
      toast.success('Thêm khu phố thành công');
      setNewWardName('');
      loadWards();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi thêm khu phố');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khu phố này?')) return;
    try {
      await fetchApi(`/mttq-api/admin/wards/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa khu phố');
      // Adjust page if last item on page deleted
      const newTotal = wards.length - 1;
      const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE) || 1;
      if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      loadWards();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa');
    }
  };

  const handleEdit = (ward) => {
    setEditingId(ward.id);
    setEditName(ward.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await fetchApi(`/mttq-api/admin/wards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      toast.success('Cập nhật thành công');
      setEditingId(null);
      loadWards();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi cập nhật');
    }
  };

  // Pagination
  const totalPages = Math.ceil(wards.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentWards = wards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="card">
      <div className="card-header">Danh sách Khu phố / Địa bàn</div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Nhập tên khu phố mới..."
          value={newWardName}
          onChange={(e) => setNewWardName(e.target.value)}
          className="form-control"
          style={{ maxWidth: '300px' }}
        />
        <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '10px 20px' }}>
          Thêm khu phố
        </button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', width: '80px' }}>ID</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Tên Khu phố</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentWards.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                      Chưa có dữ liệu khu phố.
                    </td>
                  </tr>
                ) : (
                  currentWards.map((ward) => (
                    <tr key={ward.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>#{ward.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>
                        {editingId === ward.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="form-control"
                              style={{ maxWidth: '200px', padding: '6px 10px' }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdate(ward.id)}
                              style={{ padding: '6px 14px', background: 'var(--primary-red)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{ padding: '6px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', cursor: 'pointer' }}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          ward.name
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {editingId !== ward.id && (
                          <span style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleEdit(ward)}
                              title="Sửa"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 6px', borderRadius: '4px' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(ward.id)}
                              title="Xóa"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 6px', borderRadius: '4px' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              🗑️
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 0', borderTop: '1px solid #f1f5f9', marginTop: '8px', fontSize: '0.88rem', color: '#64748b' }}>
              <span>
                Hiển thị <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> đến{' '}
                <strong style={{ color: '#0f172a' }}>{Math.min(startIndex + ITEMS_PER_PAGE, wards.length)}</strong>{' '}
                trong tổng <strong style={{ color: '#0f172a' }}>{wards.length}</strong> khu phố
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '5px 12px', border: '1px solid #cbd5e1', borderRadius: '5px', background: currentPage === 1 ? '#f1f5f9' : '#fff',
                    color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'default' : 'pointer', fontWeight: 500
                  }}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '5px 10px', border: '1px solid', borderRadius: '5px',
                      borderColor: currentPage === page ? 'var(--primary-red)' : '#cbd5e1',
                      background: currentPage === page ? 'var(--primary-red)' : '#fff',
                      color: currentPage === page ? '#fff' : '#334155',
                      cursor: 'pointer', fontWeight: 600, minWidth: '34px'
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '5px 12px', border: '1px solid #cbd5e1', borderRadius: '5px',
                    background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                    color: currentPage === totalPages ? '#94a3b8' : '#334155',
                    cursor: currentPage === totalPages ? 'default' : 'pointer', fontWeight: 500
                  }}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
