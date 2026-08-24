import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                toast.success('Đăng nhập thành công');
                navigate('/admin');
            } else {
                toast.error(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
            }
        } catch (err) {
            toast.error('Không thể kết nối máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #da251c 0%, #991b1b 50%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Roboto', sans-serif"
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                width: '100%',
                maxWidth: '440px',
                overflow: 'hidden'
            }}>
                {/* Header đỏ */}
                <div style={{
                    background: 'linear-gradient(135deg, #da251c 0%, #991b1b 100%)',
                    padding: '32px 20px 28px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: '3px solid #fbbf24',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        <img
                            src="/logo-mttq.png"
                            alt="Logo MTTQ"
                            style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={e => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<span style="font-size:2rem">🛡️</span>';
                            }}
                        />
                    </div>
                    <h1 style={{
                        color: '#fff',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0 0 6px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}>
                        Cổng Quản trị Hệ thống
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', margin: 0 }}>
                        MTTQ Việt Nam Phường Cẩm Phả
                    </p>
                </div>

                {/* Form đăng nhập */}
                <div style={{ padding: '32px 32px 28px' }}>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                color: '#374151',
                                marginBottom: '7px'
                            }}>
                                Tên đăng nhập
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '12px', top: '50%',
                                    transform: 'translateY(-50%)', fontSize: '1rem', color: '#9ca3af'
                                }}>👤</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    placeholder="Nhập tên đăng nhập"
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px 11px 38px',
                                        border: '1.5px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#da251c'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                color: '#374151',
                                marginBottom: '7px'
                            }}>
                                Mật khẩu
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '12px', top: '50%',
                                    transform: 'translateY(-50%)', fontSize: '1rem', color: '#9ca3af'
                                }}>🔒</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Nhập mật khẩu"
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px 11px 38px',
                                        border: '1.5px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#da251c'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: loading ? '#f87171' : 'linear-gradient(135deg, #da251c 0%, #991b1b 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(218,37,28,0.35)',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9'; }}
                            onMouseLeave={e => { e.target.style.opacity = '1'; }}
                        >
                            {loading ? '⏳ Đang xác thực...' : '🔐 Đăng nhập'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '18px' }}>
                        <a href="/" style={{
                            color: '#6b7280',
                            fontSize: '0.88rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#da251c'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                        >
                            ← Quay lại trang chủ
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    background: '#f8fafc',
                    borderTop: '1px solid #e5e7eb',
                    padding: '12px 20px',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    color: '#9ca3af'
                }}>
                    © 2026 Ủy ban MTTQ Việt Nam Phường Cẩm Phả
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
