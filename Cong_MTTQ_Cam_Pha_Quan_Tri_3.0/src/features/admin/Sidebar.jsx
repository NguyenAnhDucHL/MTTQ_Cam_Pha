import React from 'react';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'petitions', label: 'Phản ánh, kiến nghị', icon: MessageSquare },
    { id: 'docs', label: 'Văn bản & Thông báo', icon: FileText },
    { id: 'content', label: 'Nội dung Cổng', icon: Settings },
    { id: 'account', label: 'Tài khoản', icon: Users },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-blue-400">Admin Portal</h2>
        <p className="text-xs text-slate-400 mt-1">UBND Phường Cẩm Phả</p>
      </div>

      <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
