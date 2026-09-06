import React, { useState, useEffect } from "react";
import { SubmitForm } from "../features/petitions/SubmitForm";
import { DocumentList } from "../features/documents/DocumentList";
import { Badge } from "../components/ui/Badge";
import { fetchApi } from "../lib/api";

function Home() {
    const [activeTab, setActiveTab] = useState('submit');
    const [petitions, setPetitions] = useState([]);
    const [trackingCode, setTrackingCode] = useState('');
    const [trackResult, setTrackResult] = useState(null);
    const [trackError, setTrackError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const mobileOverlayStyles = `fixed inset-0 w-screen h-screen bg-black/50 z-[999] transition-all duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`;
    const mainNavStyles = `fixed top-0 -left-[300px] w-[280px] h-screen bg-white z-[1000] transition-all duration-300 overflow-y-auto shadow-[2px_0_8px_rgba(0,0,0,0.1)] md:sticky md:left-0 md:w-auto md:h-auto md:z-[100] md:overflow-visible md:shadow-[0_2px_4px_rgba(0,0,0,0.05)] md:border-b-2 md:border-[#da251c] ${isMobileMenuOpen ? '!left-0' : ''}`;
    const navContainerStyles = "flex flex-col py-2.5 px-0 md:flex-row md:max-w-[1200px] md:mx-auto md:overflow-x-auto md:py-0";
    const navItemBase = "flex items-center gap-2 cursor-pointer transition-all duration-200 justify-start text-left border-none border-b border-[#f1f5f9] rounded-none px-5 py-4 text-[1rem] whitespace-normal bg-transparent text-[#334155] hover:bg-[#f8fafc] hover:text-[#da251c] md:justify-start md:border-b-[3px] md:border-transparent md:px-[22px] md:py-[14px] md:text-[0.95rem] md:text-[#0f172a] md:whitespace-nowrap md:hover:bg-[#fef2f2] font-medium";
    const navItemActive = "bg-[#fff5f5] !text-[#da251c] border-l-4 border-l-[#da251c] font-semibold md:border-l-0 md:border-b-[#da251c] md:font-bold md:!bg-[#fff5f5]";

    useEffect(() => {
        if (activeTab === 'search') {
            loadPetitions(page);
        }
    }, [activeTab, page]);

    const loadPetitions = async (currentPage) => {
        try {
            const res = await fetchApi(`/mttq-api/petitions?page=${currentPage}&limit=9`);
            // Response is now { data, total, page, limit }
            setPetitions(res.data || []);
            setTotalPages(Math.ceil((res.total || 0) / 9));
        } catch (e) {
            console.error('Failed to load petitions:', e);
        }
    };

    const handleTrack = async () => {
        setTrackError('');
        setTrackResult(null);
        if (!trackingCode.trim()) {
            setTrackError('Vui lòng nhập mã tra cứu.');
            return;
        }
        try {
            const res = await fetchApi(`/mttq-api/petitions/track/${trackingCode.trim()}`);
            setTrackResult(res);
        } catch (e) {
            setTrackError(e.message || 'Lỗi tra cứu');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="bg-gradient-to-br from-[#da251c] to-[#991b1b] text-white py-[18px] px-5 shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-nowrap md:flex-wrap px-1 md:px-0 gap-2 md:gap-[15px]">
                    <div className="flex items-center flex-row justify-start flex-1 min-w-0 md:flex-none md:gap-3 gap-2">
                        <button className="md:hidden flex items-center justify-center bg-transparent border-none text-white cursor-pointer p-0 shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.2)] border-2 border-[#fbbf24] shrink-0">
                            <img src="/logo-mttq.png" alt="Logo Mặt trận Tổ quốc Việt Nam" className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] object-contain block rounded-full" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-[1.35rem] font-bold uppercase tracking-[0.5px] text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Ủy ban MTTQ Việt Nam Phường Cẩm Phả</h1>
                            <p className="text-[0.95rem] text-[#fef08a] font-normal mt-1">CỔNG TIẾP NHẬN, XỬ LÝ PHẢN ÁNH, KIẾN NGHỊ CỦA ĐOÀN VIÊN, HỘI VIÊN VÀ NHÂN DÂN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {localStorage.getItem('token') ? (
                            <a href="/admin" className="bg-white/15 text-white border border-white/30 px-4 py-2 md:px-5 md:py-2.5 rounded-full no-underline text-[0.85rem] md:text-[0.95rem] font-medium transition-all duration-300 ease-in-out inline-flex items-center gap-2 whitespace-nowrap hover:bg-white hover:text-[#da251c] hover:shadow-md">
                                ⚙️ Vào trang Quản trị
                            </a>
                        ) : (
                            <a href="/admin/login" className="bg-white/15 text-white border border-white/30 px-4 py-2 md:px-5 md:py-2.5 rounded-full no-underline text-[0.85rem] md:text-[0.95rem] font-medium transition-all duration-300 ease-in-out inline-flex items-center gap-2 whitespace-nowrap hover:bg-white hover:text-[#da251c] hover:shadow-md">
                                🔒 Đăng nhập cán bộ
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <div className={mobileOverlayStyles} onClick={() => setIsMobileMenuOpen(false)}></div>
            <nav className={mainNavStyles}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 md:hidden">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo-mttq.png" alt="Logo" className="w-10 h-10 object-contain block" />
                        <span className="font-bold text-[#da251c]">MTTQ Cẩm Phả</span>
                    </div>
                    <button className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center justify-center p-1" onClick={() => setIsMobileMenuOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className={navContainerStyles}>
                    <div className={`${navItemBase} ${activeTab === 'submit' ? navItemActive : ''}`} onClick={() => { setActiveTab('submit'); setIsMobileMenuOpen(false); }}>
                        📝 Gửi phản ánh, kiến nghị
                    </div>
                    <div className={`${navItemBase} ${activeTab === 'search' ? navItemActive : ''}`} onClick={() => { setActiveTab('search'); setIsMobileMenuOpen(false); }}>
                        🔍 Tra cứu & Danh sách phản ánh
                    </div>
                    <div className={`${navItemBase} ${activeTab === 'docs' ? navItemActive : ''}`} onClick={() => { setActiveTab('docs'); setIsMobileMenuOpen(false); }}>
                        📄 Văn bản, Thông báo
                    </div>
                    <a href="https://www.quangninh.gov.vn/donvi/campha/Trang/ChiTietBVGioiThieu.aspx?bvid=19" target="_blank" rel="noreferrer" className={`${navItemBase} !border-b-0 md:!border-b-[3px] !text-[#1e293b]`} title="Mở trang Tổ chức, bộ máy UBMTTQ phường" onClick={() => setIsMobileMenuOpen(false)}>
                        🏛️ Tổ chức, bộ máy UBMTTQ phường
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-70"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                </div>
            </nav>

            <main className="max-w-[1200px] mx-auto px-4 my-6 min-h-[65vh]">
                {activeTab === 'submit' && (
                    <section className="block animate-fade-in">
                        <h2 className="text-[1.4rem] font-bold text-[#1e293b] mb-5 flex items-center gap-2.5 border-l-[5px] border-l-[#da251c] pl-3">Hệ thống tiếp nhận phản ánh, kiến nghị người dân</h2>
                        <SubmitForm />
                    </section>
                )}

                {activeTab === 'search' && (
                    <section className="block animate-fade-in">
                        <h2 className="text-[1.4rem] font-bold text-[#1e293b] mb-5 flex items-center gap-2.5 border-l-[5px] border-l-[#da251c] pl-3">Tra cứu kết quả giải quyết</h2>
                        <div className="bg-white p-8 rounded-lg border border-slate-200 mb-8 w-full shadow-sm">
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Nhập mã tra cứu (VD: CP-240824-A1B2)"
                                    value={trackingCode}
                                    onChange={(e) => setTrackingCode(e.target.value)}
                                    className="flex-1 px-5 py-3.5 rounded-lg border border-slate-300 text-[1.05rem] focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/20 transition-all duration-200"
                                />
                                <button
                                    onClick={handleTrack}
                                    className="bg-green-700 text-white px-8 py-3.5 border-none rounded-lg cursor-pointer font-bold text-[1.05rem] hover:bg-green-800 transition-all shadow-sm md:w-auto w-full flex items-center justify-center gap-2"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    Tra Cứu
                                </button>
                            </div>
                            {trackError && <div className="text-red-500 mt-3 text-sm">{trackError}</div>}

                            {trackResult && (
                                <div className="mt-5 p-5 bg-slate-50 border-l-4 border-l-green-800 rounded">
                                    <h4 className="m-0 mb-3 text-base font-bold text-slate-800">{trackResult.title}</h4>
                                    <div className="flex gap-6 text-sm text-slate-600 mb-3">
                                        <div><strong>Mã đơn:</strong> {trackResult.trackingCode}</div>
                                        <div><strong>Ngày gửi:</strong> {new Date(trackResult.createdAt).toLocaleString('vi-VN')}</div>
                                        <div><strong>Lĩnh vực:</strong> {trackResult.category}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <strong className="text-sm text-slate-600 font-bold">Trạng thái hiện tại:</strong>
                                        <Badge variant={
                                            trackResult.status === 'resolved' ? 'success' :
                                                trackResult.status === 'rejected' ? 'danger' :
                                                    trackResult.status === 'processing' ? 'primary' : 'warning'
                                        }>
                                            {trackResult.status === 'resolved' ? 'Đã giải quyết' :
                                                trackResult.status === 'rejected' ? 'Bị từ chối' :
                                                    trackResult.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>

                        <h2 className="text-[1.4rem] font-bold text-[#1e293b] mb-5 flex items-center gap-2.5 border-l-[5px] border-l-[#da251c] pl-3">Danh sách phản ánh công khai</h2>
                        {petitions.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                Chưa có phản ánh nào được ghi nhận.
                            </div>
                        ) : (
                            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                                {petitions.map(p => (
                                    <div key={p.id} className="border border-slate-200 rounded-lg p-5 bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={p.status === 'pending' ? 'warning' : p.status === 'processing' ? 'primary' : p.status === 'rejected' ? 'danger' : 'success'}>
                                                {p.status === 'pending' ? '⏳ Chờ xử lý' : p.status === 'processing' ? '🔄 Đang xử lý' : p.status === 'rejected' ? '❌ Bị từ chối' : '✅ Đã giải quyết'}
                                            </Badge>
                                            <span className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-[15px]">{p.title}</h4>
                                        <div className="text-sm text-slate-500 space-y-1">
                                            <p><strong>Lĩnh vực:</strong> {p.category}</p>
                                            <p><strong>Người gửi:</strong> {p.fullName}</p>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-2">{p.content.substring(0, 100)}{p.content.length > 100 ? '...' : ''}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className={`px-4 py-2 rounded-md border border-slate-300 ${page === 1 ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white cursor-pointer hover:bg-slate-50'}`}
                                >
                                    Trang trước
                                </button>
                                <div className="px-4 py-2 bg-slate-100 rounded-md font-semibold text-slate-700">
                                    Trang {page} / {totalPages}
                                </div>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className={`px-4 py-2 rounded-md border border-slate-300 ${page === totalPages ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white cursor-pointer hover:bg-slate-50'}`}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'docs' && (
                    <section className="block animate-fade-in">
                        <h2 className="text-[1.4rem] font-bold text-[#1e293b] mb-5 flex items-center gap-2.5 border-l-[5px] border-l-[#da251c] pl-3">Văn bản, Thông báo & Chỉ đạo điều hành</h2>
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            Đang cập nhật tính năng tra cứu văn bản...
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Home;
