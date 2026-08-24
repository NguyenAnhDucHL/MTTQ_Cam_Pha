import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { fetchApi } from '../../lib/api';

export function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cccd: '',
    address: '',
    title: '',
    category: 'Giao thông',
    content: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.title || !formData.content) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    setIsSubmitting(true);
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    files.forEach(file => {
      submitData.append('images', file);
    });

    try {
      await fetchApi('/api/petitions', {
        method: 'POST',
        body: submitData
      });

      toast.success('Gửi phản ánh thành công!');
      // Reset form
      setFormData({
        fullName: '', phone: '', cccd: '', address: '',
        title: '', category: 'Giao thông', content: ''
      });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi phản ánh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Họ và tên <span className="text-red-500">*</span></label>
          <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Số điện thoại <span className="text-red-500">*</span></label>
          <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0987654321" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Số CCCD</label>
          <Input name="cccd" value={formData.cccd} onChange={handleChange} placeholder="0142..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Địa chỉ</label>
          <Input name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, Tên đường..." />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tiêu đề phản ánh <span className="text-red-500">*</span></label>
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Tóm tắt vấn đề..." required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Lĩnh vực</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Giao thông">Giao thông</option>
          <option value="Môi trường">Môi trường</option>
          <option value="Trật tự đô thị">Trật tự đô thị</option>
          <option value="Đất đai">Đất đai</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nội dung chi tiết <span className="text-red-500">*</span></label>
        <Textarea name="content" value={formData.content} onChange={handleChange} placeholder="Mô tả rõ vấn đề cần phản ánh..." className="min-h-[120px]" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Đính kèm hình ảnh (nếu có)</label>
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-sm text-slate-500">Kéo thả file vào đây hoặc click để chọn ảnh</p>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        {files.length > 0 && (
          <div className="mt-2 text-sm text-blue-600">
            Đã chọn {files.length} tệp.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Đang gửi...' : 'Gửi phản ánh'}
        </Button>
      </div>
    </form>
  );
}
