import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #da251c 0%, #991b1b 100%)',
                    padding: '32px 20px 28px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-md border-4 border-yellow-400" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '4px solid #facc15', margin: '0 auto 16px auto' }}>
                        <img
                            src="/logo-mttq.png"
                            alt="Logo MTTQ"
                            className="w-16 h-16 rounded-full object-cover"
                            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={e => { e.target.src = '/logo.png'; }}
                        />
                    </div>
                    <h1 className="text-white text-xl font-bold uppercase tracking-wide text-center drop-shadow-sm" style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                        Cổng Quản trị Hệ thống
                    </h1>
                    <p className="text-red-100 text-sm mt-1 text-center font-medium" style={{ margin: '4px 0 0 0', color: '#fee2e2', fontSize: '0.875rem' }}>
                        MTTQ Việt Nam Phường Cẩm Phả
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-7" style={{ padding: '28px 32px' }}>
                    <form onSubmit={handleLogin} className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="space-y-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="text-sm font-semibold text-slate-700" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0 }}>Tên đăng nhập</label>
                            <div className="relative" style={{ position: 'relative' }}>
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    placeholder="Nhập tên đăng nhập"
                                    style={{ padding: '10px 12px 10px 40px', height: '40px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="text-sm font-semibold text-slate-700" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0 }}>Mật khẩu</label>
                            <div className="relative" style={{ position: 'relative' }}>
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Nhập mật khẩu"
                                    style={{ padding: '10px 40px 10px 40px', height: '40px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    tabIndex={-1}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: '#94a3b8' }} /> : <Eye className="w-4 h-4" style={{ color: '#94a3b8' }} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-2 text-base font-bold text-white shadow-md"
                            style={{ background: loading ? '#f87171' : 'linear-gradient(135deg, #da251c 0%, #991b1b 100%)', border: 'none', width: '100%', height: '44px', borderRadius: '6px', marginTop: '8px', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {loading ? '⏳ Đang xác thực...' : '🔐 Đăng nhập'}
                        </Button>
                    </form>

                    <div className="text-center mt-6 pt-5 border-t border-slate-100" style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors font-medium"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}
                        >
                            <ArrowLeft className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                            Quay lại trang chủ
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-medium" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 0', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    © 2026 Ủy ban MTTQ Việt Nam Phường Cẩm Phả
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
