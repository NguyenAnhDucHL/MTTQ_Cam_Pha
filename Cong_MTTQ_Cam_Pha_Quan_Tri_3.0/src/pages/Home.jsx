import React, { useState, useEffect } from "react";
import { SubmitForm } from "../features/petitions/SubmitForm";
import { Badge } from "../components/ui/Badge";
import { fetchApi } from "../lib/api";

function Home() {
    const [activeTab, setActiveTab] = useState('submit');
    const [petitions, setPetitions] = useState([]);

    useEffect(() => {
        if (activeTab === 'search') {
            loadPetitions();
        }
    }, [activeTab]);

    const loadPetitions = async () => {
        try {
            const data = await fetchApi('/api/petitions');
            setPetitions(data);
        } catch (e) {
            console.error('Failed to load petitions:', e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
                            <img src="/logo-mttq.png" alt="Logo MTTQ" className="w-10 h-10 object-contain" onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/M%E1%BA%B7t_tr%E1%BA%ADn_T%E1%BB%95_qu%E1%BB%91c_Vi%E1%BB%87t_Nam.svg/1024px-M%E1%BA%B7t_tr%E1%BA%ADn_T%E1%BB%95_qu%E1%BB%91c_Vi%E1%BB%87t_Nam.svg.png' }} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide">Cổng tiếp nhận phản ánh, kiến nghị</h1>
                            <p className="text-sm md:text-base text-blue-100">Ủy ban MTTQ Việt Nam Phường Cẩm Phả</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                        <a href="/admin/login" className="text-sm px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-md transition-colors border border-blue-600">
                            Đăng nhập Cán bộ
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Banner */}
                <div className="bg-blue-100 border border-blue-200 text-blue-800 rounded-lg p-4 mb-8 flex items-start gap-3 shadow-sm">
                    <span className="text-xl">📢</span>
                    <div>
                        <h4 className="font-semibold text-blue-900">Hoan nghênh người dân tham gia đóng góp ý kiến</h4>
                        <p className="text-sm mt-1 opacity-90">Mọi thông tin phản ánh của quý vị sẽ được bảo mật và chuyển trực tiếp đến cán bộ phụ trách để giải quyết trong thời gian sớm nhất.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('submit')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'submit' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        GỬI PHẢN ÁNH, KIẾN NGHỊ
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'search' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        TRA CỨU TIẾN ĐỘ
                    </button>
                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'docs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        VĂN BẢN, THÔNG BÁO
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white p-2 md:p-6 rounded-xl">
                    {activeTab === 'submit' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-semibold mb-6 text-slate-800">Biểu mẫu gửi phản ánh</h2>
                            <SubmitForm />
                        </div>
                    )}

                    {activeTab === 'search' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-semibold mb-6 text-slate-800">Danh sách Phản ánh gần đây</h2>
                            {petitions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                                    Chưa có phản ánh nào được ghi nhận.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {petitions.map(p => (
                                        <div key={p.id} className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <Badge variant={p.status === 'pending' ? 'warning' : 'success'}>
                                                    {p.status === 'pending' ? '⏳ Chờ xử lý' : '✅ Đã giải quyết'}
                                                </Badge>
                                                <span className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <h4 className="font-semibold text-slate-800 line-clamp-2" title={p.title}>{p.title}</h4>
                                            <div className="text-sm text-slate-500">
                                                <p><span className="font-medium">Lĩnh vực:</span> {p.category}</p>
                                                <p><span className="font-medium">Người gửi:</span> {p.fullName}</p>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-3 mt-2">{p.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                            Đang cập nhật tính năng tra cứu văn bản...
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">ỦY BAN MTTQ VIỆT NAM PHƯỜNG CẨM PHẢ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><span className="mr-2">📍</span> <strong>Địa chỉ:</strong> 376, Đường Trần Phú, Phường Cẩm Phả, TP Cẩm Phả, Quảng Ninh</li>
                            <li><span className="mr-2">📞</span> <strong>Đường dây nóng:</strong> 0936.833.564 - 0363.789.100</li>
                            <li><span className="mr-2">✉️</span> <strong>Email:</strong> ubmttqphuongcampha@gmail.com</li>
                            <li><span className="mr-2">⏰</span> <strong>Giờ làm việc:</strong> 07h30 - 17h00 (T2-T6)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">HỖ TRỢ KỸ THUẬT & LIÊN HỆ</h4>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Bộ phận CNTT & Truyền thông<br />
                            Ủy ban MTTQ Việt Nam Phường Cẩm Phả<br />
                            Hỗ trợ công dân gửi phản ánh 24/7 qua hệ thống Website.
                        </p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                    © 2026 Bản quyền thuộc về Ủy ban Mặt trận Tổ quốc Việt Nam Phường Cẩm Phả - Tỉnh Quảng Ninh.
                </div>
            </footer>
        </div>
    );
}

export default Home;
