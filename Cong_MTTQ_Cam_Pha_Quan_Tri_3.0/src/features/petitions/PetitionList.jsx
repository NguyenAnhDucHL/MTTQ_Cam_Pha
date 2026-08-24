import React, { useState } from 'react';
import { PetitionDetailModal } from './PetitionDetailModal';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';
import { Search, RefreshCw, Trash2, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', className: 'status-badge status-pending' },
  processing: { label: 'Đang xử lý', className: 'status-badge status-processing' },
  resolved: { label: 'Đã giải quyết', className: 'status-badge status-completed' },
  rejected: { label: 'Từ chối', className: 'status-badge status-rejected' },
};

export function PetitionList({ petitions, onUpdateStatus, onDelete, onRefresh }) {
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Search
  const filtered = petitions.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const current = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phản ánh này?')) return;
    try {
      await fetchApi(`/api/admin/petitions/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa phản ánh thành công');
      if (current.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
      if (onDelete) onDelete(id);
    } catch (err) {
      toast.error(err.message || 'Không thể xóa phản ánh.');
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap', gap: '10px'
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark-blue)' }}>
          Danh sách Phản ánh, kiến nghị
          {filtered.length > 0 && (
            <span style={{ marginLeft: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              ({filtered.length} kết quả)
            </span>
          )}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="search-box" style={{ position: 'relative', minWidth: 0 }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề, người gửi, SĐT..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-control"
              style={{ paddingLeft: '32px', width: '250px', height: '36px', fontSize: '0.88rem' }}
            />
          </div>
          <button
            onClick={onRefresh}
            className="btn-download"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '36px', cursor: 'pointer' }}
          >
            <RefreshCw style={{ width: '13px', height: '13px' }} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid var(--border-color)' }}>
              {['Trạng thái', 'Tiêu đề', 'Lĩnh vực', 'Người gửi', 'Ngày gửi', 'Thao tác'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {searchTerm ? '🔍 Không tìm thấy kết quả phù hợp' : '📋 Chưa có phản ánh nào'}
                </td>
              </tr>
            ) : current.map(p => {
              const st = STATUS_MAP[p.status] || STATUS_MAP.pending;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span className={st.className}>{st.label}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--dark-blue)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title}>
                    {p.title}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.category}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>{p.fullName}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedPetition(p)}
                        title="Xem chi tiết"
                        className="btn-download"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Eye style={{ width: '13px', height: '13px' }} />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Xóa"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 10px', borderRadius: '4px', border: '1px solid #fca5a5',
                          background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px', borderTop: '1px solid var(--border-color)', background: '#f8fafc',
          fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px'
        }}>
          <span>
            Hiển thị <strong style={{ color: 'var(--dark-blue)' }}>{startIdx + 1}</strong>–
            <strong style={{ color: 'var(--dark-blue)' }}>{Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)}</strong>{' '}
            trong tổng <strong style={{ color: 'var(--dark-blue)' }}>{filtered.length}</strong> phản ánh
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-download"
                style={{ cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '5px 10px', border: '1px solid', borderRadius: '4px', cursor: 'pointer',
                    fontWeight: 600, minWidth: '34px', fontSize: '0.85rem',
                    borderColor: currentPage === page ? 'var(--primary-red)' : '#cbd5e1',
                    background: currentPage === page ? 'var(--primary-red)' : '#fff',
                    color: currentPage === page ? '#fff' : '#334155',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-download"
                style={{ cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}

      <PetitionDetailModal
        petition={selectedPetition}
        isOpen={!!selectedPetition}
        onClose={() => setSelectedPetition(null)}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
