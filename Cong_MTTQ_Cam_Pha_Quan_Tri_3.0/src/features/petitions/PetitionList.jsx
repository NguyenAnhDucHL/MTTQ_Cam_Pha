import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PetitionDetailModal } from './PetitionDetailModal';

export function PetitionList({ petitions, onUpdateStatus, onRefresh }) {
  const [selectedPetition, setSelectedPetition] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Danh sách Phản ánh, kiến nghị</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          🔄 Làm mới
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Tiêu đề</th>
              <th className="px-6 py-3">Lĩnh vực</th>
              <th className="px-6 py-3">Người gửi</th>
              <th className="px-6 py-3">Ngày gửi</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {petitions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              petitions.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Badge variant={p.status === 'pending' ? 'warning' : 'success'}>
                      {p.status === 'pending' ? 'Chờ xử lý' : 'Đã giải quyết'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate" title={p.title}>
                    {p.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.category}</td>
                  <td className="px-6 py-4 text-slate-600">{p.fullName}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedPetition(p)}
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PetitionDetailModal 
        petition={selectedPetition}
        isOpen={!!selectedPetition}
        onClose={() => setSelectedPetition(null)}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
