import React, { useState } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PetitionDetailModal } from './PetitionDetailModal';
import { Search, RefreshCw, Eye, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const STATUS_CFG = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  processing: { label: 'Đang xử lý', variant: 'warning' },
  resolved: { label: 'Đã giải quyết', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'default' },
};

export function PetitionList({ petitions, onUpdateStatus, onDelete, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filtered = petitions.filter(p => {
    const q = search.toLowerCase();
    return (p.title?.toLowerCase().includes(q) ||
      p.fullName?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const rows = filtered.slice(start, start + ITEMS_PER_PAGE);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000); // reset after 3s
      return;
    }

    try {
      await fetchApi(`/api/admin/petitions/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa thành công');
      setDeletingId(null);
      if (rows.length === 1 && page > 1) setPage(p => p - 1);
      if (selected?.id === id) setSelected(null);
      onDelete?.(id);
    } catch (err) {
      toast.error(err.message || 'Không thể xóa');
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="font-semibold text-slate-700">
          Danh sách Phản ánh, kiến nghị
          {filtered.length > 0 && <span className="ml-2 text-xs text-slate-400 font-normal">({filtered.length} kết quả)</span>}
        </span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm tiêu đề, người gửi, SĐT..."
              value={search}
              onChange={handleSearch}
              className="pl-9 w-[300px]"
              style={{ padding: '8px 12px 8px 36px', height: '40px', width: '300px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              {['Trạng thái', 'Tiêu đề', 'Lĩnh vực', 'Người gửi', 'Ngày gửi', 'Thao tác'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#fff' }}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  {search ? '🔍 Không tìm thấy kết quả phù hợp' : '📋 Chưa có phản ánh nào'}
                </td>
              </tr>
            ) : rows.map(p => {
              const cfg = STATUS_CFG[p.status] || STATUS_CFG.pending;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.title}>
                    {p.title}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap', fontWeight: 500 }}>{p.fullName}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(p); }} style={{ height: '32px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', gap: '6px', fontWeight: 600 }}>
                        <Eye className="w-4 h-4" /> Chi tiết
                      </Button>
                      <Button variant="destructive" size="sm" onClick={(e) => handleDelete(p.id, e)} style={{ height: '32px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', gap: '6px', fontWeight: 600, background: deletingId === p.id ? '#991b1b' : '#ef4444', color: '#fff', border: 'none' }}>
                        <Trash2 className="w-4 h-4" /> {deletingId === p.id ? 'Xác nhận xóa' : 'Xóa'}
                      </Button>
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-700">{start + 1}</strong>–
            <strong className="text-slate-700">{Math.min(start + ITEMS_PER_PAGE, filtered.length)}</strong>
            {' '}trong <strong className="text-slate-700">{filtered.length}</strong> phản ánh
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-7 px-2">←</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <Button
                  key={pg}
                  size="sm"
                  variant={page === pg ? 'default' : 'outline'}
                  onClick={() => setPage(pg)}
                  className="h-7 w-7 p-0"
                >
                  {pg}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 px-2">→</Button>
            </div>
          )}
        </div>
      )}

      <PetitionDetailModal
        petition={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={onUpdateStatus}
        onDelete={(id) => handleDelete(id, null)}
        deletingId={deletingId}
      />
    </div>
  );
}
