import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../features/admin/Sidebar';
import { PetitionList } from '../features/petitions/PetitionList';
import { fetchApi } from '../lib/api';
import { toast } from 'sonner';

function AdminDashboard() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('petitions');
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
    
    if (activeTab === 'petitions') {
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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 p-8">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Tổng quan hệ thống</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm font-medium text-slate-500 uppercase">Tổng số phản ánh</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{petitions.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm border-amber-200">
                <p className="text-sm font-medium text-amber-600 uppercase">Đang chờ xử lý</p>
                <p className="text-3xl font-bold text-amber-700 mt-2">
                  {petitions.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm border-emerald-200">
                <p className="text-sm font-medium text-emerald-600 uppercase">Đã giải quyết</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  {petitions.filter(p => p.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'petitions' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý Phản ánh, kiến nghị</h1>
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <PetitionList 
                petitions={petitions} 
                onUpdateStatus={handleUpdateStatus} 
                onRefresh={loadPetitions}
              />
            )}
          </div>
        )}

        {(activeTab === 'docs' || activeTab === 'content' || activeTab === 'account') && (
          <div className="animate-in fade-in duration-300 flex items-center justify-center h-64 bg-white rounded-xl border shadow-sm border-dashed">
            <p className="text-slate-500 text-lg">Tính năng đang được phát triển...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
