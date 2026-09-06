import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetitionList } from '../features/petitions/PetitionList';
import { AdminWards } from '../features/admin/AdminWards';
import { AdminAccounts } from '../features/admin/AdminAccounts';
import { fetchApi } from '../lib/api';
import { toast } from 'sonner';

function AdminDashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, resolved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tong-quan');
    const navigate = useNavigate();

    const loadStats = async () => {
        try {
            const data = await fetchApi('/mttq-api/admin/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        if (activeTab === 'tong-quan') {
            loadStats();
        }
    }, [activeTab, navigate]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.info("Đã đăng xuất");
        navigate('/admin/login');
    };

    const navItemClick = (tabId) => {
        setActiveTab(tabId);
        setIsMenuOpen(false);
    };

    return (
        <div>
            {/* Top Header */}
            <header className="bg-gradient-to-br from-[#da251c] to-[#991b1b] text-white py-[18px] px-5 shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-nowrap md:flex-wrap px-1 md:px-0 gap-2 md:gap-[15px]">
                    <div className="flex items-center flex-row justify-start flex-1 min-w-0 md:flex-none md:gap-3 gap-2">
                        <button className="md:hidden flex items-center justify-center bg-transparent border-none text-white cursor-pointer p-0 shrink-0" onClick={() => setIsMenuOpen(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.2)] border-2 border-[#fbbf24] shrink-0">
                            <img
                                src="/logo-mttq.png"
                                alt="Logo MTTQ"
                                className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] object-contain block rounded-full"
                                onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/vi/4/4b/Huy_hi%E1%BB%87u_M%E1%BA%B7t_tr%E1%BA%ADn_T%E1%BB%95_qu%E1%BB%91c_Vi%E1%BB%87t_Nam.png'; }}
                            />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-[1.35rem] font-bold uppercase tracking-[0.5px] text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Quản trị Hệ thống</h1>
                            <p className="text-[0.95rem] text-[#fef08a] font-normal mt-1">Cổng thông tin MTTQ Phường Cẩm Phả</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button onClick={handleLogout} className="bg-white/15 text-white border border-white/30 px-3 py-1.5 md:px-[18px] md:py-[8px] rounded-[20px] no-underline text-[0.85rem] md:text-[0.9rem] font-medium transition-all duration-200 ease-in-out inline-flex items-center gap-1.5 whitespace-nowrap hover:bg-white hover:text-[#da251c] cursor-pointer">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            <div className={`mobile-overlay ${isMenuOpen ? 'show' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

            {/* Navigation Bar */}
            <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <span style={{ fontWeight: 700, color: 'var(--primary-red)' }}>MENU QUẢN TRỊ</span>
                    <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="nav-container">
                    <div className={`nav-item ${activeTab === 'tong-quan' ? 'active' : ''}`} onClick={() => navItemClick('tong-quan')}>
                        Tổng quan
                    </div>
                    <div className={`nav-item ${activeTab === 'phan-anh' ? 'active' : ''}`} onClick={() => navItemClick('phan-anh')}>
                        Phản ánh, kiến nghị
                    </div>
                    <div className={`nav-item ${activeTab === 'khu-pho' ? 'active' : ''}`} onClick={() => navItemClick('khu-pho')}>
                        Quản lý Khu phố
                    </div>
                    <div className={`nav-item ${activeTab === 'van-ban' ? 'active' : ''}`} onClick={() => navItemClick('van-ban')}>
                        Văn bản & Thông báo
                    </div>
                    <div className={`nav-item ${activeTab === 'noi-dung' ? 'active' : ''}`} onClick={() => navItemClick('noi-dung')}>
                        Nội dung Cổng
                    </div>
                    <div className={`nav-item ${activeTab === 'tai-khoan' ? 'active' : ''}`} onClick={() => navItemClick('tai-khoan')}>
                        Tài khoản
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-wrapper">
                {activeTab === 'tong-quan' && (
                    <div className="tab-content active">
                        <h2 className="section-title">Tổng quan hệ thống</h2>
                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--accent-blue)' }}>TỔNG SỐ PHẢN ÁNH</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                    {stats.total || 0}
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid var(--warning-orange)' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--warning-orange)' }}>ĐANG CHỜ XỬ LÝ</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-orange)' }}>
                                    {stats.pending || 0}
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid var(--success-green)' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--success-green)' }}>ĐÃ GIẢI QUYẾT</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-green)' }}>
                                    {stats.resolved || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'phan-anh' && (
                    <div className="tab-content active">
                        <h2 className="section-title">Quản lý Phản ánh, kiến nghị</h2>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                Đang tải dữ liệu...
                            </div>
                        ) : (
                            <PetitionList />
                        )}
                    </div>
                )}

                {activeTab === 'khu-pho' && (
                    <div className="tab-content active">
                        <h2 className="section-title">Quản lý Khu phố</h2>
                        <AdminWards />
                    </div>
                )}

                {activeTab === 'tai-khoan' && (
                    <div className="tab-content active">
                        <AdminAccounts />
                    </div>
                )}

                {(activeTab === 'van-ban' || activeTab === 'noi-dung') && (
                    <div className="tab-content active">
                        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '1.2rem' }}>Tính năng đang được phát triển...</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
