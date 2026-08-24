# Quy trình Hoạt động & Deploy (Operational Workflow)

## 1. Môi trường Máy chủ (Server Topology)
Hệ thống **MTTQ Cẩm Phả Quản Trị 3.0** được chạy trên máy chủ VPS của VNPT (IP: `14.225.172.225`).

Cảnh báo quan trọng: Máy chủ này **CHIA SẺ CHUNG MỘT NGINX REVERSE PROXY** với các hệ thống khác của phường (như Lịch Công Tác, Tool Calendar, v.v.).

```
VNPT SERVER (14.225.172.225) — TOPOLOGY:
  /root/docker-compose.yml        → nginx-proxy (port 80/443) — DÙNG CHUNG CỦA TOÀN BỘ VPS
                                  → cong_mttq_cam_pha_quan_tri_30_frontend_1
                                  → cong_mttq_cam_pha_quan_tri_30_backend_1
```

## 2. Quy trình Deploy Lên VPS
Hệ thống đã được thiết lập CI/CD bằng **Github Actions**. Toàn bộ quá trình Deploy được tự động hóa.

**Các bước AI/Developer cần làm:**
1. Viết code hoàn chỉnh, đảm bảo test kĩ ở Local.
2. Gom (squash) các thay đổi và sử dụng lệnh `git commit -am "<type>(<scope>): <mô tả>"` (tuân thủ Conventional Commits).
3. Chạy lệnh `git push origin main`.
4. Ngay khi code được push lên nhánh `main`, Github Actions sẽ tự động kích hoạt tiến trình Build Docker Image và SSH vào VPS để kéo Image mới nhất về chạy.
5. Để theo dõi tiến trình Deploy, AI có thể gõ lệnh `gh run list -L 1` và `gh run watch <RUN_ID> --exit-status` trên Terminal nội bộ.

> [!CAUTION]
> **LUẬT THÉP BẢO VỆ MÁY CHỦ SỐNG (PRODUCTION)**
> - KHÔNG BAO GIỜ được SSH vào VPS VNPT để gõ lệnh `docker-compose down`. Lệnh này sẽ làm tắt ngỏm toàn bộ Nginx Proxy chung và kéo sập tất cả các Web App khác đang hoạt động trên máy chủ đó (hàng ngàn người dùng sẽ bị ảnh hưởng).
> - Quá trình Deploy đã được Github Actions lo liệu (nó chỉ khởi động lại riêng lẻ container của MTTQ). KHÔNG tự ý can thiệp trừ khi được chỉ định rõ ràng!
