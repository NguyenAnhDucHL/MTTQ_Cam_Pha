import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PetitionDetailModal } from './PetitionDetailModal';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/api';

export function PetitionList({ petitions, onUpdateStatus, onDelete, onRefresh }) {
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(petitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPetitions = petitions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản ánh này? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      await fetchApi(`/api/admin/petitions/${id}`, {
        method: 'DELETE'
      });
      toast.success("Đã xóa phản ánh thành công");

      // Adjust page if deleting the last item on the current page
      if (currentPetitions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      toast.error(err.message || "Không thể xóa phản ánh.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Danh sách Phản ánh, kiến nghị</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          🔄 Làm mới
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Tiêu đề</th>
              <th className="px-6 py-3">Lĩnh vực</th>
              <th className="px-6 py-3">Người gửi</th>
              <th className="px-6 py-3">Ngày gửi</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentPetitions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              currentPetitions.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Badge variant={p.status === 'pending' ? 'warning' : 'success'}>
                      {p.status === 'pending' ? 'Chờ xử lý' : 'Đã giải quyết'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate" title={p.title}>
                    {p.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.category}</td>
                  <td className="px-6 py-4 text-slate-600">{p.fullName}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPetition(p)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(p.id)}
                        className="px-3"
                        title="Xóa phản ánh"
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-slate-50 flex items-center justify-between text-sm text-slate-500 mt-auto">
          <div>
            Hiển thị <span className="font-medium text-slate-800">{startIndex + 1}</span> đến{' '}
            <span className="font-medium text-slate-800">
              {Math.min(startIndex + itemsPerPage, petitions.length)}
            </span>{' '}
            trong số <span className="font-medium text-slate-800">{petitions.length}</span> kết quả
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3"
            >
              Trước
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-9"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              Sau
            </Button>
          </div>
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
