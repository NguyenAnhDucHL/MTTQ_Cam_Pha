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
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
            <header className="header-top">
                <div className="header-container">
                    <div className="brand-info">
                        <div className="logo-emblem">
                            <img src="/logo-mttq.png" alt="Logo Mặt trận Tổ quốc Việt Nam" className="mttq-logo" />
                        </div>
                        <div className="brand-text">
                            <h1>Ủy ban MTTQ Việt Nam Phường Cẩm Phả</h1>
                            <p>CỔNG TIẾP NHẬN, XỬ LÝ PHẢN ÁNH, KIẾN NGHỊ CỦA ĐOÀN VIÊN, HỘI VIÊN VÀ NHÂN DÂN</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <a href="/admin/login" className="btn-login">
                            🔒 Đăng nhập cán bộ
                        </a>
                    </div>
                </div>
            </header>

            <nav className="main-nav">
                <div className="nav-container">
                    <div className={`nav-item ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
                        📝 Gửi phản ánh, kiến nghị
                    </div>
                    <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
                        🔍 Tra cứu & Danh sách phản ánh
                    </div>
                    <div className={`nav-item ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>
                        📄 Văn bản, Thông báo
                    </div>
                    <a href="https://www.quangninh.gov.vn/donvi/campha/Trang/ChiTietBVGioiThieu.aspx?bvid=19" target="_blank" rel="noreferrer" className="nav-item nav-item-link" title="Mở trang Tổ chức, bộ máy UBMTTQ phường">
                        🏛️ Tổ chức, bộ máy UBMTTQ phường
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '2px', opacity: 0.7}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                </div>
            </nav>

            <main className="main-wrapper">
                {activeTab === 'submit' && (
                    <section className="tab-content active">
                        <h2 className="section-title">Hệ thống tiếp nhận phản ánh, kiến nghị người dân</h2>
                        <SubmitForm />
                    </section>
                )}

                {activeTab === 'search' && (
                    <section className="tab-content active">
                        <h2 className="section-title">Tra cứu & Danh sách phản ánh</h2>
                        {petitions.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '3rem 0', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                                Chưa có phản ánh nào được ghi nhận.
                            </div>
                        ) : (
                            <div style={{display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'}}>
                                {petitions.map(p => (
                                    <div key={p.id} style={{border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                            <Badge variant={p.status === 'pending' ? 'warning' : 'success'}>
                                                {p.status === 'pending' ? '⏳ Chờ xử lý' : '✅ Đã giải quyết'}
                                            </Badge>
                                            <span style={{fontSize: '12px', color: '#94a3b8'}}>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <h4 style={{fontWeight: 600, color: '#1e293b', fontSize: '15px'}}>{p.title}</h4>
                                        <div style={{fontSize: '14px', color: '#64748b'}}>
                                            <p><strong>Lĩnh vực:</strong> {p.category}</p>
                                            <p><strong>Người gửi:</strong> {p.fullName}</p>
                                        </div>
                                        <p style={{fontSize: '14px', color: '#475569', marginTop: '8px'}}>{p.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'docs' && (
                    <section className="tab-content active">
                        <h2 className="section-title">Văn bản, Thông báo & Chỉ đạo điều hành</h2>
                        <div style={{textAlign: 'center', padding: '3rem 0', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                            Đang cập nhật tính năng tra cứu văn bản...
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Home;
