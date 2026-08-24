import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetitionList } from '../features/petitions/PetitionList';
import { AdminWards } from '../features/admin/AdminWards';
import { fetchApi } from '../lib/api';
import { toast } from 'sonner';

function AdminDashboard() {
    const [petitions, setPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tong-quan');
    const navigate = useNavigate();

    const loadPetitions = async () => {
        setLoading(true);
        try {
            const data = await fetchApi('/api/admin/petitions');
            setPetitions(data);
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                toast.error("Không thể tải danh sách phản ánh.");
            }
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

        if (activeTab === 'tong-quan' || activeTab === 'phan-anh') {
            loadPetitions();
        }
    }, [activeTab, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.info("Đã đăng xuất");
        navigate('/admin/login');
    };

    const handleUpdateStatus = (id, newStatus) => {
        setPetitions(petitions.map(p => p.id === id ? { ...p, status: newStatus } : p));
    };

    const handleDelete = (id) => {
        setPetitions(petitions.filter(p => p.id !== id));
    };

    return (
        <div>
            {/* Top Header */}
            <header className="header-top">
                <div className="header-container">
                    <div className="brand-info">
                        <div className="logo-emblem">
                            <img 
                                src="/logo-mttq.png" 
                                alt="Logo MTTQ" 
                                className="mttq-logo" 
                                onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/vi/4/4b/Huy_hi%E1%BB%87u_M%E1%BA%B7t_tr%E1%BA%ADn_T%E1%BB%95_qu%E1%BB%91c_Vi%E1%BB%87t_Nam.png'; }}
                            />
                        </div>
                        <div className="brand-text">
                            <h1>Quản trị Hệ thống</h1>
                            <p>Cổng thông tin MTTQ Phường Cẩm Phả</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button onClick={handleLogout} className="btn-login" style={{ cursor: 'pointer', border: 'none' }}>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="main-nav">
                <div className="nav-container">
                    <div className={`nav-item ${activeTab === 'tong-quan' ? 'active' : ''}`} onClick={() => setActiveTab('tong-quan')}>
                        Tổng quan
                    </div>
                    <div className={`nav-item ${activeTab === 'phan-anh' ? 'active' : ''}`} onClick={() => setActiveTab('phan-anh')}>
                        Phản ánh, kiến nghị
                    </div>
                    <div className={`nav-item ${activeTab === 'khu-pho' ? 'active' : ''}`} onClick={() => setActiveTab('khu-pho')}>
                        Quản lý Khu phố
                    </div>
                    <div className={`nav-item ${activeTab === 'van-ban' ? 'active' : ''}`} onClick={() => setActiveTab('van-ban')}>
                        Văn bản & Thông báo
                    </div>
                    <div className={`nav-item ${activeTab === 'noi-dung' ? 'active' : ''}`} onClick={() => setActiveTab('noi-dung')}>
                        Nội dung Cổng
                    </div>
                    <div className={`nav-item ${activeTab === 'tai-khoan' ? 'active' : ''}`} onClick={() => setActiveTab('tai-khoan')}>
                        Tài khoản
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-wrapper">
                {activeTab === 'tong-quan' && (
                    <div className="tab-content active">
                        <h2 className="section-title">Tổng quan hệ thống</h2>
                        <div className="form-grid">
                            <div className="card" style={{ borderLeft: '4px solid var(--warning-orange)' }}>
                                <div className="text-muted" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>ĐANG CHỜ XỬ LÝ</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-orange)' }}>
                                    {petitions.filter(p => p.status === 'pending').length}
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid var(--success-green)' }}>
                                <div className="text-muted" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>ĐÃ GIẢI QUYẾT</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-green)' }}>
                                    {petitions.filter(p => p.status === 'resolved').length}
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
                            <PetitionList
                                petitions={petitions}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={handleDelete}
                                onRefresh={loadPetitions}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'khu-pho' && (
                    <div className="tab-content active">
                        <h2 className="section-title">Quản lý Khu phố</h2>
                        <AdminWards />
                    </div>
                )}

                {(activeTab === 'van-ban' || activeTab === 'noi-dung' || activeTab === 'tai-khoan') && (
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
