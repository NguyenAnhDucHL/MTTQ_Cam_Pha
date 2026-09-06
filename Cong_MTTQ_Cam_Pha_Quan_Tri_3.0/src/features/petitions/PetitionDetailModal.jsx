import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { fetchApi } from '../../lib/api';

export function PetitionDetailModal({ petition, isOpen, onClose, onUpdateStatus, onDelete, deletingId }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Update notes when petition changes
  React.useEffect(() => {
    if (petition) {
      setNotes(petition.adminNotes || '');
    }
  }, [petition]);

  if (!petition) return null;

  const handleResolve = async () => {
    setIsUpdating(true);
    try {
      await fetchApi(`/mttq-api/admin/petitions/${petition.id}/status`, {
        method: 'PATCH',
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

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await fetchApi(`/mttq-api/admin/petitions/${petition.id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes: notes })
      });
      toast.success('Đã lưu ghi chú thành công!');
      // Update local object so it doesn't revert on next render (hacky but works for now without Redux)
      petition.adminNotes = notes;
    } catch (err) {
      toast.error(err.message || 'Lỗi kết nối tới máy chủ.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const images = petition.imagePaths ? petition.imagePaths.split(',').filter(Boolean) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Hồ sơ Phản ánh">
      <div className="flex flex-col gap-6 p-2">

        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{petition.title}</h3>
            <div className="flex gap-2 items-center">
              <Badge variant={petition.status === 'pending' ? 'warning' : 'success'}>
                {petition.status === 'pending' ? '⏳ Đang chờ xử lý' : '✅ Đã giải quyết'}
              </Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-300">
                {petition.category}
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            Ngày gửi:<br />
            <span className="font-semibold text-slate-700">
              {new Date(petition.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Người gửi</p>
            <p className="font-medium text-slate-800 m-0">{petition.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Điện thoại</p>
            <p className="font-medium text-slate-800 m-0">{petition.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">CCCD</p>
            <p className="font-medium text-slate-800 m-0">{petition.cccd || 'Không cung cấp'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Địa bàn / Khu phố</p>
            <p className="font-medium text-slate-800 m-0">{petition.ward || 'Không cung cấp'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Địa chỉ chi tiết (Số nhà, tên đường, hẻm)</p>
            <p className="font-medium text-slate-800 m-0">{petition.address || 'Không cung cấp'}</p>
          </div>
        </div>

        {/* Content */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Nội dung chi tiết:</h4>
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap break-words leading-relaxed text-[0.95rem]">
            {petition.content}
          </div>
        </div>

        {/* Attachments */}
        {images && images.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2.5">Tài liệu đính kèm ({images.length}):</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
              {images.map((img, idx) => {
                const isPdf = img.toLowerCase().endsWith('.pdf');
                const containerClass = `block rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50 relative shadow-sm ${isPdf ? 'cursor-default' : 'cursor-pointer'}`;

                return isPdf ? (
                  <a
                    key={idx}
                    href={`/mttq-uploads/${img}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${containerClass} no-underline`}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <span className="text-3xl mb-2">📄</span>
                      <span className="text-xs px-2 text-center break-all">{img.substring(img.indexOf('-') + 1).slice(0, 15)}...</span>
                    </div>
                  </a>
                ) : (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(`/mttq-uploads/${img}`)}
                    className={containerClass}
                  >
                    <img
                      loading="lazy"
                      src={`/mttq-uploads/${img}`}
                      alt={`Đính kèm ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="mt-2">
          <label className="text-[0.85rem] font-semibold text-slate-700 block mb-2">Ghi chú xử lý (Nội bộ Admin)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded-md border border-slate-300 text-sm resize-y focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            placeholder="Nhập ghi chú xử lý nội bộ... (Người dân không nhìn thấy ghi chú này)"
          />
          <div className="text-right mt-2">
            <Button variant="outline" onClick={handleSaveNotes} disabled={isSavingNotes || notes === petition.adminNotes} className="text-[13px] px-3 py-1.5">
              {isSavingNotes ? 'Đang lưu...' : '💾 Lưu ghi chú'}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-5 border-t border-slate-200 flex justify-between items-center">
          <div>
            <Button variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(petition.id); }} className={`font-semibold text-white px-4 py-2.5 rounded-md border-none inline-flex items-center gap-2 ${deletingId === petition.id ? 'bg-red-800' : 'bg-red-500 hover:bg-red-600'}`}>
              {deletingId === petition.id ? 'Xác nhận xóa' : '🗑️ Xóa'}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="font-semibold px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 inline-flex items-center hover:bg-slate-50">Đóng</Button>
            {petition.status === 'pending' && (
              <Button variant="success" onClick={handleResolve} disabled={isUpdating} className="font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-md border-none inline-flex items-center gap-2">
                {isUpdating ? '⏳ Đang xử lý...' : '✅ Đánh dấu đã giải quyết'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white text-4xl bg-transparent border-none cursor-pointer z-[10000] p-2.5 leading-none hover:text-slate-300"
          >
            &times;
          </button>
          <img
            loading="lazy"
            src={previewImage}
            alt="Preview"
            className="max-w-[95%] max-h-[95%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Modal>
  );
}
