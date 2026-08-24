---
name: "mttq-vps-diagnostics"
description: "Use this skill when you need to run diagnostics, check logs, or inspect the VPS Production environment (14.225.172.225) securely without breaking the shared Nginx proxy. Triggered when the user asks to check VPS logs or status."
---

# 🛡️ Mttq Vps Diagnostics Skill

Kỹ năng này cung cấp hướng dẫn an toàn để AI có thể kiểm tra trạng thái máy chủ VPS của dự án MTTQ Cẩm Phả mà không gây ảnh hưởng đến các dịch vụ khác (như Tool Calendar, Lịch Công Tác).

## 🚀 Cách thức hoạt động
Hệ thống có cung cấp sẵn một file Expect script tên là `check_vps.exp` nằm ở thư mục gốc `/Users/macbookpro/MTTQ CamPha/check_vps.exp`.
File này chứa sẵn mật khẩu SSH để AI có thể tự động chạy lệnh trên VPS mà không bị chặn bởi prompt nhập mật khẩu.

## 🛠️ Các lệnh được phép chạy trên VPS (thông qua `check_vps.exp`)
Để chạy một lệnh, bạn cần sửa nội dung dòng `spawn ssh ...` trong file `check_vps.exp` thành lệnh bạn muốn, sau đó thực thi file script này.

**1. Kiểm tra trạng thái Docker Containers:**
```bash
# Sửa dòng 3 của check_vps.exp thành:
spawn ssh -o StrictHostKeyChecking=no root@14.225.172.225 "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

**2. Đọc Log Backend (100 dòng cuối):**
```bash
# Sửa dòng 3 của check_vps.exp thành:
spawn ssh -o StrictHostKeyChecking=no root@14.225.172.225 "docker logs --tail 100 cong_mttq_cam_pha_quan_tri_30_backend_1"
```

**3. Đọc Log Frontend (100 dòng cuối):**
```bash
# Sửa dòng 3 của check_vps.exp thành:
spawn ssh -o StrictHostKeyChecking=no root@14.225.172.225 "docker logs --tail 100 cong_mttq_cam_pha_quan_tri_30_frontend_1"
```

## ⚠️ Quy tắc Cấm (Red Lines)
- **TUYỆT ĐỐI KHÔNG** chạy `docker-compose down` trên VPS.
- **TUYỆT ĐỐI KHÔNG** đụng chạm vào thư mục `/root/lichcongtac/` trên VPS.
- Bất kỳ khi nào truy cập VPS, phải ghi log lại vào file `VPS_DEBUG_LOG.md` (nếu cần thiết).
