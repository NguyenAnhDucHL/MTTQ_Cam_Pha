import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { fetchApi } from '../../lib/api';

const FilePreview = ({ file }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file.type.startsWith('image/')) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontSize: '24px' }} title={file.name}>
        📄
      </div>
    );
  }
  return <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

export function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [trackingCode, setTrackingCode] = useState(null);
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
    fetchApi('/mttq-api/wards')
      .then(res => setWardsList(res.data || res || []))
      .catch(err => console.error('Failed to load wards:', err));

    // Load draft
    const draft = localStorage.getItem('petitionDraft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) { }
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
      const validFiles = selectedFiles.filter(file => {
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`Tệp ${file.name} quá lớn (vượt quá 25MB).`);
          return false;
        }
        return true;
      });

      setFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        if (newFiles.length > 20) {
          toast.error('Chỉ được phép tải lên tối đa 20 tệp/ảnh.');
          return newFiles.slice(0, 20);
        }
        return newFiles;
      });

      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
      const response = await fetchApi('/mttq-api/petitions', {
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
      setTrackingCode(response.trackingCode);

    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi phản ánh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (trackingCode) {
    return (
      <div className="w-full text-center py-10 px-5 animate-fade-in">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ color: '#166534', marginBottom: '15px' }}>Gửi phản ánh thành công!</h2>
        <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '20px' }}>
          Cảm ơn bạn đã đóng góp ý kiến. Chính quyền sẽ xem xét và xử lý trong thời gian sớm nhất.
        </p>
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', display: 'inline-block' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>MÃ TRA CỨU CỦA BẠN</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '2px' }}>
            {trackingCode}
          </div>
          <Button
            style={{ marginTop: '15px' }}
            onClick={() => {
              navigator.clipboard.writeText(trackingCode);
              toast.success('Đã sao chép mã!');
            }}
          >
            📋 Copy Mã Tra Cứu
          </Button>
        </div>
        <div style={{ marginTop: '30px' }}>
          <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>* Lưu ý: Hãy lưu lại mã tra cứu này để theo dõi tiến độ giải quyết.</p>
          <Button variant="secondary" onClick={() => setTrackingCode(null)} style={{ marginTop: '15px' }}>
            Gửi phản ánh khác
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="w-full animate-fade-in" onSubmit={handleSubmit} id="feedbackForm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Personal Info */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-md mb-5">
          <div className="text-[1.1rem] font-bold text-[#da251c] mb-4 pb-2 border-b-2 border-dashed border-red-200 flex items-center gap-2">
            👤 1. Khai báo thông tin người gửi
          </div>
          <div className="mb-4" id="grp-fullname">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Họ và tên <span className="text-[#da251c]">*</span></label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15" placeholder="Nhập đầy đủ họ và tên..." />
          </div>

          <div className="mb-4" id="grp-phone">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Số điện thoại liên hệ <span className="text-[#da251c]">*</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15" placeholder="Nhập số điện thoại (ví dụ: 0912345678)..." />
          </div>

          <div className="mb-4" id="grp-cccd">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Số CCCD</label>
            <input type="text" name="cccd" value={formData.cccd} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15" placeholder="0142..." />
          </div>

          <div className="mb-4" id="grp-area">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Địa bàn / Khu phố <span className="text-[#da251c]">*</span></label>
            <select name="ward" value={formData.ward} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15">
              <option value="">-- Chọn Khu phố sinh sống / xảy ra vụ việc --</option>
              {wardsList.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Địa chỉ chi tiết (Số nhà, tên đường, hẻm)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15" placeholder="Ví dụ: Số 45, Tổ 2, Đường Trần Phú..." />
          </div>
        </div>

        {/* Right Column: Feedback Details */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-md mb-5">
          <div className="text-[1.1rem] font-bold text-[#da251c] mb-4 pb-2 border-b-2 border-dashed border-red-200 flex items-center gap-2">
            📌 2. Nội dung phản ánh, kiến nghị
          </div>
          <div className="mb-4" id="grp-category">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Lĩnh vực phản ánh <span className="text-[#da251c]">*</span></label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15">
              <option value="Giao thông">Trật tự đô thị - Giao thông</option>
              <option value="An ninh trật tự - PCCC">An ninh trật tự - Phòng cháy chữa cháy</option>
              <option value="Môi trường - Vệ sinh công cộng">Môi trường - Vệ sinh công cộng</option>
              <option value="Hạ tầng - Cấp thoát nước">Hạ tầng đô thị - Điện, nước, chiếu sáng</option>
              <option value="An sinh xã hội - Policy">An sinh xã hội - Chế độ chính sách</option>
              <option value="Khác">Lĩnh vực khác</option>
            </select>
          </div>

          <div className="mb-4" id="grp-title">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Tiêu đề phản ánh <span className="text-[#da251c]">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15" placeholder="Tóm tắt ngắn gọn vụ việc..." />
          </div>

          <div className="mb-4" id="grp-content">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Nội dung chi tiết <span className="text-[#da251c]">*</span></label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows="4" className="w-full p-2.5 border border-slate-300 rounded-md text-[0.95rem] text-slate-800 bg-white transition-all duration-200 outline-none focus:border-[#da251c] focus:ring-[3px] focus:ring-[#da251c]/15 min-h-[120px]" placeholder="Mô tả cụ thể thời gian, địa điểm, sự việc phản ánh hoặc đề xuất kiến nghị..."></textarea>
          </div>

          <div className="mb-4">
            <label className="block font-medium text-[0.9rem] text-slate-800 mb-1.5">Đính kèm ảnh / Tệp tài liệu (nếu có)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 cursor-pointer transition-all duration-200 hover:border-[#da251c] hover:bg-red-50" onClick={() => fileInputRef.current?.click()}>
              <div className="text-[2rem] text-slate-500 mb-1.5">📁</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Bấm để chọn tệp hoặc kéo thả tệp vào đây</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>Hỗ trợ ảnh PNG, JPG, PDF (Tối đa 25MB)</div>
              <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '4px', fontWeight: 500 }}>* Lưu ý: Hệ thống chỉ cho phép tải lên tối đa 20 ảnh/tệp đính kèm.</div>
              <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,application/pdf" />
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '14px', color: '#166534', marginBottom: '10px', fontWeight: '500' }}>
                  Đã chọn {files.length} tệp (Nhấp dấu x để xóa):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                  {files.map((file, index) => (
                    <div key={index} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                      >
                        &times;
                      </button>
                      <FilePreview file={file} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center w-full">
        <Button
          type="submit"
          variant="destructive"
          size="lg"
          className="w-full max-w-[400px] md:w-[360px] rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-base uppercase tracking-wider font-bold h-14 mx-auto"
          disabled={isSubmitting || cooldownTime > 0}
        >
          {cooldownTime > 0
            ? `Vui lòng đợi ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, '0')} để gửi tiếp`
            : isSubmitting ? 'Đang xử lý...' : 'GỬI PHẢN ÁNH, KIẾN NGHỊ'}
        </Button>
      </div>
    </form>
  );
}
