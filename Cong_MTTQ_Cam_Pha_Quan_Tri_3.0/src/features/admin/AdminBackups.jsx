import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export function AdminBackups() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [creating, setCreating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const loadBackups = async () => {
        try {
            setLoading(true);
            const data = await fetchApi('/mttq-api/admin/backups');
            setBackups(data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách sao lưu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackups();
    }, []);

    const handleCreateBackup = async () => {
        try {
            setCreating(true);
            const toastId = toast.loading('Đang tiến hành sao lưu dữ liệu...');
            await fetchApi('/mttq-api/admin/backups', { method: 'POST' });
            toast.success('Sao lưu thành công!', { id: toastId });
            loadBackups();
        } catch (error) {
            toast.error(error.message || 'Lỗi khi tạo sao lưu');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = (filename) => {
        // Có thể mở thẻ tab mới đính kèm API để tải
        window.open(`/mttq-api/admin/backups/download/${filename}`, '_blank');
    };

    const handleDelete = async (filename) => {
        try {
            await fetchApi(`/mttq-api/admin/backups/${filename}`, { method: 'DELETE' });
            toast.success('Đã xóa bản sao lưu thành công');
            setDeleteTarget(null);
            loadBackups();
        } catch (error) {
            toast.error(error.message || 'Lỗi khi xóa bản sao lưu');
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalBackups = backups.length;
    const totalPages = Math.ceil(totalBackups / ITEMS_PER_PAGE) || 1;

    useEffect(() => {
        if (currentPage > totalPages && totalPages >= 1) {
            setCurrentPage(totalPages);
        }
    }, [totalBackups, currentPage, totalPages]);

    const paginatedBackups = backups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 m-0">Sao lưu & Phục hồi dữ liệu (Disaster Recovery)</h3>
                    <p className="text-sm text-slate-500 m-0 mt-1">Hệ thống sẽ tự động sao lưu dữ liệu vào 02:00 AM mỗi ngày và lưu tối đa 7 ngày.</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors disabled:bg-blue-400"
                >
                    {creating ? 'Đang tạo...' : '+ Tạo bản sao lưu ngay'}
                </button>
            </div>

            {loading ? (
                <p className="text-slate-500">Đang tải danh sách...</p>
            ) : backups.length === 0 ? (
                <p className="text-slate-500 italic p-4 bg-slate-50 rounded text-center">Chưa có bản sao lưu nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-3 font-semibold text-slate-700">Tên file</th>
                                <th className="p-3 font-semibold text-slate-700">Kích thước</th>
                                <th className="p-3 font-semibold text-slate-700">Ngày tạo</th>
                                <th className="p-3 font-semibold text-slate-700 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBackups.map((backup) => (
                                <tr key={backup.filename} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">{backup.filename}</td>
                                    <td className="p-3 text-slate-600">{formatSize(backup.size)}</td>
                                    <td className="p-3 text-slate-600">{new Date(backup.createdAt).toLocaleString('vi-VN')}</td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDownload(backup.filename)}
                                                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1.5 rounded text-[0.85rem] font-medium transition-colors border-none cursor-pointer flex items-center gap-1.5"
                                            >
                                                ⬇ Tải xuống
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(backup.filename)}
                                                className="bg-[#da251c] hover:bg-[#b71c1c] text-white px-3 py-1.5 rounded text-[0.85rem] font-medium transition-colors border-none cursor-pointer flex items-center gap-1.5"
                                            >
                                                ❌ Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalBackups > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-between mt-4 p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
                            <div className="text-sm text-slate-500">
                                Hiển thị <strong className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> đến{' '}
                                <strong className="text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalBackups)}</strong>{' '}
                                trong tổng số <strong className="text-slate-900">{totalBackups}</strong> bản sao lưu
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 border border-slate-300 rounded-md font-medium transition-colors ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'}`}
                                >
                                    Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2.5 py-1.5 border rounded-md font-semibold cursor-pointer min-w-[34px] transition-colors ${currentPage === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 border border-slate-300 rounded-md font-medium transition-colors ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'}`}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Xác nhận xóa bản sao lưu"
            >
                <div className="mb-6 text-slate-600">
                    Bạn có chắc chắn muốn xóa bản sao lưu <strong>{deleteTarget}</strong> không? Hành động này không thể hoàn tác.
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={() => handleDelete(deleteTarget)}
                        className="bg-[#da251c] hover:bg-[#b71c1c] text-white border-none"
                    >
                        Xác nhận xóa
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
