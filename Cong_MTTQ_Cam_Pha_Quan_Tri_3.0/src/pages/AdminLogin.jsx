import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { fetchApi } from '../lib/api';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await fetchApi('/mttq-api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            // setAuthToken is deprecated, cookie is set automatically
            window.location.href = '/admin';
            toast.success('Đăng nhập thành công');
            navigate('/admin');
        } catch (err) {
            toast.error(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(160deg,#da251c_0%,#991b1b_50%,#1e293b_100%)] flex items-center justify-center p-5 font-roboto">
            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-full max-w-[440px] overflow-hidden">

                {/* Header */}
                <div className="bg-[linear-gradient(135deg,#da251c_0%,#991b1b_100%)] pt-8 px-5 pb-7 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 mx-auto shadow-md border-4 border-yellow-400">
                        <img
                            src="/logo-mttq.png"
                            alt="Logo MTTQ"
                            className="w-16 h-16 rounded-full object-cover"

                            onError={e => { e.target.src = '/logo.png'; }}
                        />
                    </div>
                    <h1 className="text-white text-xl font-bold uppercase tracking-wide text-center drop-shadow-sm" >
                        Cổng Quản trị Hệ thống
                    </h1>
                    <p className="text-red-100 text-sm mt-1 text-center font-medium" >
                        MTTQ Việt Nam Phường Cẩm Phả
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-7">
                    <form onSubmit={handleLogin} className="space-y-5 flex flex-col gap-5">
                        <div className="space-y-1.5 flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 m-0">Tên đăng nhập</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    placeholder="Nhập tên đăng nhập"
                                    className="pl-10 pr-3 py-2.5 h-10 rounded-md border border-slate-300 w-full box-border focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 m-0">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Nhập mật khẩu"
                                    className="px-10 py-2.5 h-10 rounded-md border border-slate-300 w-full box-border focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-none cursor-pointer p-0 flex"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-11 mt-2 text-base font-bold text-white shadow-md border-none rounded-md flex items-center justify-center transition-all ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-[linear-gradient(135deg,#da251c_0%,#991b1b_100%)] hover:opacity-90 cursor-pointer'}`}
                        >
                            {loading ? '⏳ Đang xác thực...' : '🔐 Đăng nhập'}
                        </Button>
                    </form>

                    <div className="text-center mt-6 pt-5 border-t border-slate-100">
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors font-medium no-underline"
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
