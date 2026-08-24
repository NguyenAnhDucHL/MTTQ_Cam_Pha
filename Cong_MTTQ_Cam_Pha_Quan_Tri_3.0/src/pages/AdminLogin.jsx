import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { ShieldCheck, User, KeyRound, ArrowLeft } from 'lucide-react';

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
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-4000"></div>

            {/* Login Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-md transition-all duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Quản trị Hệ thống</h2>
                    <p className="text-sm text-blue-200 mt-2 font-medium">Cổng thông tin MTTQ Phường Cẩm Phả</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-200 ml-1">Tên đăng nhập</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Nhập tài khoản"
                                autoComplete="off"
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:bg-white/10 focus:border-blue-400 focus:ring-blue-400/50 h-12 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-200 ml-1">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-slate-400" />
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Nhập mật khẩu"
                                autoComplete="new-password"
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:bg-white/10 focus:border-blue-400 focus:ring-blue-400/50 h-12 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-12 mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 border-0"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xác thực...
                            </span>
                        ) : 'Đăng nhập'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <a href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Quay lại trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
