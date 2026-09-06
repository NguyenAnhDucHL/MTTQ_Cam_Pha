import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';

const ITEMS_PER_PAGE = 10;

export function AdminWards() {
  const [wards, setWards] = useState([]);
  const [totalWards, setTotalWards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newWardName, setNewWardName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadWards = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(`/mttq-api/wards?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      setWards(res.data || []);
      setTotalWards(res.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách khu phố');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, [currentPage]);

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
      const newTotal = totalWards - 1;
      const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE) || 1;
      if (currentPage > newTotalPages && newTotalPages >= 1) setCurrentPage(newTotalPages);
      else loadWards();
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
  const totalPages = Math.ceil(totalWards / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentWards = wards;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="font-bold text-lg text-slate-800 mb-5 pb-3 border-b border-slate-100">Danh sách Khu phố / Địa bàn</div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2.5 mb-5 items-center">
        <input
          type="text"
          placeholder="Nhập tên khu phố mới..."
          value={newWardName}
          onChange={(e) => setNewWardName(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full max-w-[300px]"
        />
        <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-semibold rounded-md border-none cursor-pointer w-auto px-5 py-2.5">
          Thêm khu phố
        </button>
      </form>

      {loading ? (
        <div className="text-center p-8 text-slate-500">Đang tải...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.95rem]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="p-3 text-left font-semibold text-slate-500 w-[80px]">ID</th>
                  <th className="p-3 text-left font-semibold text-slate-500">Tên Khu phố</th>
                  <th className="p-3 text-right font-semibold text-slate-500 w-[120px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentWards.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">
                      Chưa có dữ liệu khu phố.
                    </td>
                  </tr>
                ) : (
                  currentWards.map((ward) => (
                    <tr key={ward.id} className="border-b border-slate-100">
                      <td className="p-3 text-slate-500">#{ward.id}</td>
                      <td className="p-3 font-medium text-slate-900">
                        {editingId === ward.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border border-slate-300 rounded-md focus:outline-none focus:border-red-500 max-w-[200px] px-2.5 py-1.5"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdate(ward.id)}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-md cursor-pointer font-semibold"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          ward.name
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {editingId !== ward.id && (
                          <span className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleEdit(ward)}
                              title="Sửa"
                              className="bg-transparent border-none cursor-pointer text-[1.1rem] px-1.5 py-1 rounded hover:bg-amber-100"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(ward.id)}
                              title="Xóa"
                              className="bg-transparent border-none cursor-pointer text-[1.1rem] px-1.5 py-1 rounded hover:bg-red-100"
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
            <div className="flex justify-between items-center pt-3.5 mt-2 border-t border-slate-100 text-[0.88rem] text-slate-500">
              <span>
                Hiển thị <strong className="text-slate-900">{startIndex + 1}</strong> đến{' '}
                <strong className="text-slate-900">{Math.min(startIndex + ITEMS_PER_PAGE, totalWards)}</strong>{' '}
                trong tổng <strong className="text-slate-900">{totalWards}</strong> khu phố
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 border border-slate-300 rounded-md font-medium ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'}`}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1.5 border rounded-md font-semibold cursor-pointer min-w-[34px] ${currentPage === page ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 border border-slate-300 rounded-md font-medium ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'}`}
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
