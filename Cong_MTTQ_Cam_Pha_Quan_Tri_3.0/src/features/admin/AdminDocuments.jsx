import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { toast } from 'sonner';
import { 
  FileText, Plus, Search, Edit2, Trash2, X, Upload, 
  Calendar, Hash, File as FileIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    documentNumber: '',
    issueDate: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDocuments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetchApi(`/mttq-api/admin/documents?page=${pageNum}&limit=10&search=${search}`);
      const data = res.data || [];
      const total = res.total || 0;
      setDocuments(data);
      setTotalPages(Math.ceil(total / 10) || 1);
      setPage(pageNum);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách văn bản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments(1);
  };

  const openModal = (doc = null) => {
    if (doc) {
      setCurrentDoc(doc);
      setFormData({
        title: doc.title || '',
        documentNumber: doc.documentNumber || '',
        issueDate: doc.issueDate || '',
        content: doc.content || ''
      });
    } else {
      setCurrentDoc(null);
      setFormData({ title: '', documentNumber: '', issueDate: '', content: '' });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDoc(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Vui lòng nhập Tên/Trích yếu văn bản');
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('documentNumber', formData.documentNumber.trim());
      data.append('issueDate', formData.issueDate);
      data.append('content', formData.content.trim());
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      let res;
      if (currentDoc) {
        res = await fetchApi(`/mttq-api/admin/documents/${currentDoc.id}`, {
          method: 'PUT',
          body: data
        });
      } else {
        res = await fetchApi('/mttq-api/admin/documents', {
          method: 'POST',
          body: data
        });
      }
      
      toast.success(res.message || 'Lưu văn bản thành công');
      closeModal();
      fetchDocuments(page);
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu văn bản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa văn bản này?')) return;
    
    try {
      await fetchApi(`/mttq-api/admin/documents/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa văn bản');
      fetchDocuments(page);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa văn bản');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Quản lý Văn bản, Thông báo</h2>
            <p className="text-sm text-slate-500">Quản lý và đăng tải các văn bản chỉ đạo điều hành</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm văn bản..."
              className="pl-9 h-10 w-full"
            />
          </form>
          <Button onClick={() => openModal()} className="h-10 shrink-0 gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm mới</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Số/Ký hiệu</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Trích yếu</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày ban hành</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-center w-24">File</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-right w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  Không có văn bản nào.
                </td>
              </tr>
            ) : (
              documents.map(doc => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">
                    {doc.documentNumber || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700 line-clamp-2">{doc.title}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {doc.fileUrl ? (
                      <a 
                        href={`/mttq-api${doc.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Xem file"
                      >
                        <FileIcon className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(doc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
          <p className="text-sm text-slate-500">
            Trang <span className="font-medium text-slate-900">{page}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => fetchDocuments(page - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => fetchDocuments(page + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {currentDoc ? 'Cập nhật Văn bản' : 'Thêm Văn bản mới'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Trích yếu / Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Nhập trích yếu hoặc nội dung văn bản..."
                    className="w-full h-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-slate-400" /> Số/Ký hiệu
                    </label>
                    <Input
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                      placeholder="VD: 123/UBND"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" /> Ngày ban hành
                    </label>
                    <Input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    File đính kèm (PDF)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-red-400 hover:bg-red-50/50 transition-colors relative group">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 text-slate-300 group-hover:text-red-400 transition-colors" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label className="relative cursor-pointer rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                          <span>{selectedFile ? selectedFile.name : 'Tải file lên'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,application/pdf"
                            className="sr-only" 
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                if (e.target.files[0].size > 25 * 1024 * 1024) {
                                  toast.error('File quá lớn. Tối đa 25MB');
                                  return;
                                }
                                setSelectedFile(e.target.files[0]);
                              }
                            }} 
                          />
                        </label>
                        {!selectedFile && <p className="pl-1">hoặc kéo thả vào đây</p>}
                      </div>
                      <p className="text-xs text-slate-500">PDF lên tới 25MB</p>
                    </div>
                  </div>
                  {currentDoc?.fileUrl && !selectedFile && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <FileIcon className="w-3.5 h-3.5" /> File hiện tại đã được đính kèm. Tải lên file mới sẽ ghi đè file cũ.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu Văn bản'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
