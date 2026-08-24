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
        } catch {
            toast.error('Không thể kết nối máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(160deg, #da251c 0%, #991b1b 45%, #1e293b 100%)', fontFamily: "'Roboto', sans-serif" }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header đỏ */}
                <div
                    className="flex flex-col items-center py-8 px-6"
                    style={{ background: 'linear-gradient(135deg, #da251c 0%, #991b1b 100%)' }}
                >
                    <div
                        className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg"
                        style={{ border: '3px solid #fbbf24' }}
                    >
                        <img
                            src="/logo-mttq.png"
                            alt="Logo MTTQ"
                            className="w-full h-full rounded-full object-cover"
                            onError={e => { e.target.src = '/logo.png'; }}
                        />
                    </div>
                    <h1 className="text-white text-xl font-bold uppercase tracking-wide text-center" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                        Cổng Quản trị Hệ thống
                    </h1>
                    <p className="text-red-100 text-sm mt-1 text-center">
                        MTTQ Việt Nam Phường Cẩm Phả
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-7">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    placeholder="Nhập tên đăng nhập"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Nhập mật khẩu"
                                    className="pl-9 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-2 font-bold text-base"
                            style={{ background: loading ? '#f87171' : 'linear-gradient(135deg, #da251c, #991b1b)', boxShadow: '0 4px 12px rgba(218,37,28,0.3)', border: 'none' }}
                        >
                            {loading ? '⏳ Đang xác thực...' : '🔐 Đăng nhập'}
                        </Button>
                    </form>

                    <div className="text-center mt-5 pt-5 border-t border-slate-100">
                        <a
                            href="/"
                            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-red-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại trang chủ
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 py-3 text-center text-xs text-slate-400">
                    © 2026 Ủy ban MTTQ Việt Nam Phường Cẩm Phả
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
