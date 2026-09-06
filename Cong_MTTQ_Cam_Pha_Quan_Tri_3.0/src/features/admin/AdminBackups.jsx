import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { toast } from 'sonner';

export function AdminBackups() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

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

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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
                            {backups.map((backup) => (
                                <tr key={backup.filename} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">{backup.filename}</td>
                                    <td className="p-3 text-slate-600">{formatSize(backup.size)}</td>
                                    <td className="p-3 text-slate-600">{new Date(backup.createdAt).toLocaleString('vi-VN')}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDownload(backup.filename)}
                                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                        >
                                            ⬇ Tải xuống
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
