import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { fetchApi } from '../../lib/api';

export function PetitionDetailModal({ petition, isOpen, onClose, onUpdateStatus }) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!petition) return null;

  const handleResolve = async () => {
    setIsUpdating(true);
    try {
      await fetchApi(`/api/admin/petitions/${petition.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' })
      });
      toast.success('Đã cập nhật trạng thái thành công!');
      onUpdateStatus(petition.id, 'resolved');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi kết nối tới máy chủ.');
    } finally {
      setIsUpdating(false);
    }
  };

  const images = petition.images ? JSON.parse(petition.images) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Hồ sơ Phản ánh">
      <div className="space-y-6">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{petition.title}</h3>
            <div className="flex gap-2 items-center">
              <Badge variant={petition.status === 'pending' ? 'warning' : 'success'}>
                {petition.status === 'pending' ? '⏳ Đang chờ xử lý' : '✅ Đã giải quyết'}
              </Badge>
              <Badge variant="outline">{petition.category}</Badge>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            Ngày gửi:<br/>
            <span className="font-semibold text-slate-700">
              {new Date(petition.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Người gửi</p>
            <p className="font-medium text-slate-800">{petition.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Điện thoại</p>
            <p className="font-medium text-slate-800">{petition.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">CCCD</p>
            <p className="font-medium text-slate-800">{petition.cccd || 'Không cung cấp'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Địa bàn / Khu phố</p>
            <p className="font-medium text-slate-800">{petition.ward || 'Không cung cấp'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Địa chỉ chi tiết (Số nhà, tên đường, hẻm)</p>
            <p className="font-medium text-slate-800">{petition.address || 'Không cung cấp'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Tiêu đề phản ánh:</h4>
          <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border">{petition.title}</p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Nội dung chi tiết:</h4>
          <div className="p-4 bg-white border rounded-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
            {petition.content}
          </div>
        </div>

        {images && images.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Tài liệu đính kèm ({images.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <a 
                  key={idx} 
                  href={`/uploads/${img}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors text-sm flex items-center gap-2"
                >
                  <span className="text-lg">📎</span>
                  Ảnh {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {petition.status === 'pending' && (
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
            <Button variant="success" onClick={handleResolve} disabled={isUpdating}>
              {isUpdating ? 'Đang xử lý...' : 'Đánh dấu đã giải quyết'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
