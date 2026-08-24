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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="flex flex-col items-center py-8 px-6 bg-red-600">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-md border-4 border-yellow-400">
                        <img
                            src="/logo-mttq.png"
                            alt="Logo MTTQ"
                            className="w-16 h-16 rounded-full object-cover"
                            onError={e => { e.target.src = '/logo.png'; }}
                        />
                    </div>
                    <h1 className="text-white text-xl font-bold uppercase tracking-wide text-center drop-shadow-sm">
                        Cổng Quản trị Hệ thống
                    </h1>
                    <p className="text-red-100 text-sm mt-1 text-center font-medium">
                        MTTQ Việt Nam Phường Cẩm Phả
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-7">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    placeholder="Nhập tên đăng nhập"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Nhập mật khẩu"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-2 text-base font-bold bg-red-600 hover:bg-red-700 text-white shadow-md"
                        >
                            {loading ? '⏳ Đang xác thực...' : '🔐 Đăng nhập'}
                        </Button>
                    </form>

                    <div className="text-center mt-6 pt-5 border-t border-slate-100">
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại trang chủ
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-medium">
                    © 2026 Ủy ban MTTQ Việt Nam Phường Cẩm Phả
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
