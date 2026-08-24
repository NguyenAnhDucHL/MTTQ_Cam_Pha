import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { fetchApi } from '../../lib/api';

export function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [files, setFiles] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cccd: '',
    address: '',
    ward: '',
    title: '',
    category: 'Giao thông',
    content: ''
  });

  useEffect(() => {
    // Fetch dynamic wards on component mount
    fetchApi('/api/wards')
      .then(data => setWardsList(data))
      .catch(err => console.error('Failed to load wards:', err));

    // Load draft
    const draft = localStorage.getItem('petitionDraft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {}
    }

    // Load cooldown
    const lastSent = localStorage.getItem('lastPetitionSent');
    if (lastSent) {
      const timePassed = Date.now() - parseInt(lastSent, 10);
      const cooldownMs = 3 * 60 * 1000; // 3 minutes
      if (timePassed < cooldownMs) {
        setCooldownTime(Math.ceil((cooldownMs - timePassed) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  useEffect(() => {
    // Save draft automatically
    const timeoutId = setTimeout(() => {
      localStorage.setItem('petitionDraft', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 20) {
        toast.error('Chỉ được phép tải lên tối đa 20 tệp/ảnh.');
        e.target.value = ''; // Reset input
        setFiles([]);
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double click

    const { fullName, phone, cccd, ward, title, content } = formData;

    if (!fullName || !phone || !ward || !title || !content) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    if (fullName.length < 2) {
      toast.error('Họ và tên phải dài ít nhất 2 ký tự');
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    if (cccd && cccd.length !== 12) {
      toast.error('Số CCCD phải bao gồm đúng 12 chữ số');
      return;
    }

    if (title.length < 5) {
      toast.error('Tiêu đề phản ánh quá ngắn (tối thiểu 5 ký tự)');
      return;
    }

    if (content.length < 10) {
      toast.error('Nội dung phản ánh quá ngắn (tối thiểu 10 ký tự)');
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
        fullName: '', phone: '', cccd: '', address: '', ward: '',
        title: '', category: 'Giao thông', content: ''
      });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      localStorage.removeItem('petitionDraft');
      localStorage.setItem('lastPetitionSent', Date.now().toString());
      setCooldownTime(3 * 60);

    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi phản ánh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="feedbackForm">
      <div className="form-grid">
        {/* Left Column: Personal Info */}
        <div className="card">
          <div className="card-header">
            👤 1. Khai báo thông tin người gửi
          </div>
          <div className="form-group" id="grp-fullname">
            <label className="form-label">Họ và tên <span className="required">*</span></label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-control" placeholder="Nhập đầy đủ họ và tên..." />
          </div>

          <div className="form-group" id="grp-phone">
            <label className="form-label">Số điện thoại liên hệ <span className="required">*</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="Nhập số điện thoại (ví dụ: 0912345678)..." />
          </div>

          <div className="form-group" id="grp-cccd">
            <label className="form-label">Số CCCD</label>
            <input type="text" name="cccd" value={formData.cccd} onChange={handleChange} className="form-control" placeholder="0142..." />
          </div>

          <div className="form-group" id="grp-area">
            <label className="form-label">Địa bàn / Khu phố <span className="required">*</span></label>
            <select name="ward" value={formData.ward} onChange={handleChange} className="form-select">
              <option value="">-- Chọn Khu phố sinh sống / xảy ra vụ việc --</option>
              {wardsList.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ chi tiết (Số nhà, tên đường, hẻm)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" placeholder="Ví dụ: Số 45, Tổ 2, Đường Trần Phú..." />
          </div>
        </div>

        {/* Right Column: Feedback Details */}
        <div className="card">
          <div className="card-header">
            📌 2. Nội dung phản ánh, kiến nghị
          </div>
          <div className="form-group" id="grp-category">
            <label className="form-label">Lĩnh vực phản ánh <span className="required">*</span></label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-select">
              <option value="Giao thông">Trật tự đô thị - Giao thông</option>
              <option value="An ninh trật tự - PCCC">An ninh trật tự - Phòng cháy chữa cháy</option>
              <option value="Môi trường - Vệ sinh công cộng">Môi trường - Vệ sinh công cộng</option>
              <option value="Hạ tầng - Cấp thoát nước">Hạ tầng đô thị - Điện, nước, chiếu sáng</option>
              <option value="An sinh xã hội - Policy">An sinh xã hội - Chế độ chính sách</option>
              <option value="Khác">Lĩnh vực khác</option>
            </select>
          </div>

          <div className="form-group" id="grp-title">
            <label className="form-label">Tiêu đề phản ánh <span className="required">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" placeholder="Tóm tắt ngắn gọn vụ việc..." />
          </div>

          <div className="form-group" id="grp-content">
            <label className="form-label">Nội dung chi tiết <span className="required">*</span></label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows="4" className="form-control" style={{ minHeight: '120px', padding: '10px' }} placeholder="Mô tả cụ thể thời gian, địa điểm, sự việc phản ánh hoặc đề xuất kiến nghị..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Đính kèm ảnh / Tệp tài liệu (nếu có)</label>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">📁</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Bấm để chọn tệp hoặc kéo thả tệp vào đây</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>Hỗ trợ ảnh PNG, JPG, PDF (Tối đa 10MB)</div>
              <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '4px', fontWeight: 500 }}>* Lưu ý: Hệ thống chỉ cho phép tải lên tối đa 20 ảnh/tệp đính kèm.</div>
              <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
            </div>
            {files.length > 0 && (
              <div className="file-list" style={{ marginTop: '10px', fontSize: '14px', color: '#166534' }}>
                Đã chọn {files.length} tệp.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button type="submit" className="btn-submit" disabled={isSubmitting || cooldownTime > 0}>
          {cooldownTime > 0 
            ? `Vui lòng đợi ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, '0')} để gửi tiếp` 
            : isSubmitting ? 'Đang gửi...' : '🚀 GỬI PHẢN ÁNH, KIẾN NGHỊ'}
        </button>
      </div>
    </form>
  );
}
