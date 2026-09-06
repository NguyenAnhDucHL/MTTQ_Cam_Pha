import React, { useState } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PetitionDetailModal } from './PetitionDetailModal';
import { Search, RefreshCw, Eye, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const STATUS_CFG = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  processing: { label: 'Đang xử lý', variant: 'warning' },
  resolved: { label: 'Đã giải quyết', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'default' },
};

export function PetitionList() {
  const [petitions, setPetitions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: ITEMS_PER_PAGE, status: statusFilter, search }).toString();
      const res = await fetchApi(`/mttq-api/admin/petitions?${q}`);
      setPetitions(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      if (err.message !== 'Unauthorized') toast.error("Không thể tải danh sách phản ánh.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  // Using a timeout for search debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const rows = petitions;

  const handleSearch = e => setSearch(e.target.value);
  const handleStatusFilter = e => { setStatusFilter(e.target.value); setPage(1); };
  const onRefresh = () => loadData();

  const onUpdateStatus = (id, status) => {
    setPetitions(petitions.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDeleteRequest = (id, e) => {
    if (e) e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fetchApi(`/mttq-api/admin/petitions/${deleteConfirmId}`, { method: 'DELETE' });
      toast.success('Đã xóa thành công');
      if (rows.length === 1 && page > 1) setPage(p => p - 1);
      else loadData();
      if (selected?.id === deleteConfirmId) setSelected(null);
    } catch (err) {
      toast.error(err.message || 'Không thể xóa');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="font-semibold text-slate-700">
          Danh sách Phản ánh, kiến nghị
          <span className="ml-2 text-xs text-slate-400 font-normal">({total} kết quả)</span>
        </span>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="px-3 py-2 h-10 rounded-md border border-slate-300 bg-white text-slate-600 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="rejected">Bị từ chối</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm tiêu đề, người gửi, SĐT..."
              value={search}
              onChange={handleSearch}
              className="pl-9 px-3 py-2 h-10 w-[300px] rounded-md border border-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              {['Trạng thái', 'Tiêu đề', 'Lĩnh vực', 'Người gửi', 'Ngày gửi', 'Thao tác'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-[0.8rem] font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  {search ? '🔍 Không tìm thấy kết quả phù hợp' : '📋 Chưa có phản ánh nào'}
                </td>
              </tr>
            ) : rows.map(p => {
              const cfg = STATUS_CFG[p.status] || STATUS_CFG.pending;
              return (
                <tr key={p.id} className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[250px] whitespace-nowrap overflow-hidden text-ellipsis" title={p.title}>
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-medium">{p.fullName}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(p); }} className="h-8 px-3 flex items-center justify-center rounded-md gap-1.5 font-semibold">
                        <Eye className="w-4 h-4" /> Chi tiết
                      </Button>
                      <Button variant="destructive" size="sm" onClick={(e) => handleDeleteRequest(p.id, e)} className="h-8 px-3 flex items-center justify-center rounded-md gap-1.5 font-semibold bg-red-500 text-white border-none hover:bg-red-600">
                        <Trash2 className="w-4 h-4" /> Xóa
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
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-700">{start + 1}</strong>–
            <strong className="text-slate-700">{Math.min(start + ITEMS_PER_PAGE, total)}</strong>
            {' '}trong <strong className="text-slate-700">{total}</strong> phản ánh
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
        onDelete={(id) => handleDeleteRequest(id, null)}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Xác nhận xóa">
        <div className="text-center py-2.5 pb-5">
          <div className="text-5xl mx-auto mb-4 text-red-500 flex justify-center">
            ⚠️
          </div>
          <p className="text-[1.05rem] text-slate-700 m-0 mb-6 leading-relaxed">
            Bạn có chắc chắn muốn xóa phản ánh này không?<br />
            Hành động này <strong className="text-red-500">không thể hoàn tác</strong>.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="px-6 py-2.5 rounded-md font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="px-6 py-2.5 rounded-md font-semibold bg-red-500 text-white border-none hover:bg-red-600">
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
