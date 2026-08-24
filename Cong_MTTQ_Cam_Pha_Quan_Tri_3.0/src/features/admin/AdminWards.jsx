import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { fetchApi } from '../../lib/api';

export function AdminWards() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWardName, setNewWardName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const loadWards = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/api/wards');
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
    if (!newWardName.trim()) return;

    try {
      const res = await fetchApi('/api/admin/wards', {
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
      await fetchApi(`/api/admin/wards/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa khu phố');
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
      await fetchApi(`/api/admin/wards/${id}`, {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Danh sách Khu phố / Địa bàn</h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <Input 
            placeholder="Nhập tên khu phố mới..." 
            value={newWardName} 
            onChange={(e) => setNewWardName(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit">Thêm khu phố</Button>
        </form>

        {loading ? (
          <div className="text-center text-slate-500 py-8">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y">
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">ID</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Tên Khu phố</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500 w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wards.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500">
                      Chưa có dữ liệu khu phố.
                    </td>
                  </tr>
                ) : (
                  wards.map((ward) => (
                    <tr key={ward.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-600">#{ward.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {editingId === ward.id ? (
                          <div className="flex gap-2">
                            <Input 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 max-w-[200px]"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleUpdate(ward.id)}>Lưu</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Hủy</Button>
                          </div>
                        ) : (
                          ward.name
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {editingId !== ward.id && (
                          <>
                            <button 
                              onClick={() => handleEdit(ward)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(ward.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
