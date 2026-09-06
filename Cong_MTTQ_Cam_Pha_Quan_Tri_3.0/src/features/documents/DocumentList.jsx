import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Search, FileText, Calendar, Hash, File as FileIcon, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchDocuments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetchApi(`/mttq-api/documents?page=${pageNum}&limit=10&search=${search}`);
      const data = res.data || [];
      const total = res.total || 0;
      setDocuments(data);
      setTotalPages(Math.ceil(total / 10) || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('Lỗi khi tải văn bản', err);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Danh sách Văn bản, Thông báo</h2>
            <p className="text-sm text-slate-500">Các văn bản chỉ đạo, thông báo mới nhất</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo số ký hiệu, trích yếu..."
            className="pl-9 h-10 w-full"
          />
        </form>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p>Đang tải danh sách văn bản...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p>Không tìm thấy văn bản, thông báo nào phù hợp.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-[1rem] font-medium text-slate-800 line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 md:gap-5 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span>Số: <strong className="text-slate-700">{doc.documentNumber || 'Chưa có'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Ngày: <strong className="text-slate-700">{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('vi-VN') : 'Chưa có'}</strong></span>
                  </div>
                </div>
              </div>

              {doc.fileUrl && (() => {
                let urls = [];
                try {
                  urls = JSON.parse(doc.fileUrl);
                } catch (e) {
                  urls = [doc.fileUrl];
                }
                if (urls.length === 0) return null;
                return (
                  <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end mt-2 md:mt-0">
                    {urls.map((url, i) => (
                      <a
                        key={i}
                        href={`/mttq-api${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md text-xs font-medium transition-colors no-underline border border-red-100"
                        title="Tải về / Xem"
                      >
                        {url.toLowerCase().endsWith('.pdf') ? <FileIcon className="w-3.5 h-3.5" /> : <span className="font-bold">IMG</span>}
                        File {i + 1}
                      </a>
                    ))}
                  </div>
                );
              })()}
            </div>
          ))
        )}
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
    </div>
  );
};
