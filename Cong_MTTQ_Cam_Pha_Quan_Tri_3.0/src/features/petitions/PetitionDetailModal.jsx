import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { fetchApi } from '../../lib/api';

export function PetitionDetailModal({ petition, isOpen, onClose, onUpdateStatus, onDelete, deletingId }) {
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

  const images = petition.imagePaths ? petition.imagePaths.split(',').filter(Boolean) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Hồ sơ Phản ánh">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>{petition.title}</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Badge variant={petition.status === 'pending' ? 'warning' : 'success'}>
                {petition.status === 'pending' ? '⏳ Đang chờ xử lý' : '✅ Đã giải quyết'}
              </Badge>
              <Badge variant="outline" style={{ background: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }}>
                {petition.category}
              </Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#64748b' }}>
            Ngày gửi:<br/>
            <span style={{ fontWeight: 600, color: '#334155' }}>
              {new Date(petition.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 4px 0' }}>Người gửi</p>
            <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>{petition.fullName}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 4px 0' }}>Điện thoại</p>
            <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>{petition.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 4px 0' }}>CCCD</p>
            <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>{petition.cccd || 'Không cung cấp'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 4px 0' }}>Địa bàn / Khu phố</p>
            <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>{petition.ward || 'Không cung cấp'}</p>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 4px 0' }}>Địa chỉ chi tiết (Số nhà, tên đường, hẻm)</p>
            <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>{petition.address || 'Không cung cấp'}</p>
          </div>
        </div>

        {/* Content */}
        <div>
          <h4 style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>Nội dung chi tiết:</h4>
          <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {petition.content}
          </div>
        </div>

        {/* Attachments */}
        {images && images.length > 0 && (
          <div>
            <h4 style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 10px 0' }}>Tài liệu đính kèm ({images.length}):</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {images.map((img, idx) => (
                <a 
                  key={idx} 
                  href={`/uploads/${img}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ padding: '8px 12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                  onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                >
                  <span style={{ fontSize: '1.1rem' }}>📎</span>
                  Ảnh đính kèm {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Button variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(petition.id); }} style={{ fontWeight: 600, background: deletingId === petition.id ? '#991b1b' : '#ef4444', color: '#fff', padding: '10px 16px', borderRadius: '6px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {deletingId === petition.id ? 'Xác nhận xóa' : '🗑️ Xóa'}
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={onClose} style={{ fontWeight: 600, padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', display: 'inline-flex', alignItems: 'center' }}>Đóng</Button>
            {petition.status === 'pending' && (
              <Button variant="success" onClick={handleResolve} disabled={isUpdating} style={{ fontWeight: 600, background: '#10b981', color: '#fff', padding: '10px 16px', borderRadius: '6px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {isUpdating ? '⏳ Đang xử lý...' : '✅ Đánh dấu đã giải quyết'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
