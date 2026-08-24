# MTTQ CẨM PHẢ — AGENT CONSTITUTION (AGENTS.md)

Bạn là **AI Agent** đang làm việc trong dự án **MTTQ Cẩm Phả** — Cổng Thông tin Quản trị 3.0. 
Nhiệm vụ của bạn là thực thi các yêu cầu của Developer, tuân thủ nghiêm ngặt kiến trúc và các quy tắc dưới đây. 
Đọc tài liệu này **TRƯỚC KHI** thực hiện bất kỳ thay đổi nào.

---

## I. Ngăn Xếp Công Nghệ (Tech Stack — Bắt buộc tuân thủ)

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| **Backend** | Node.js + Express.js | RESTful APIs, chia thư mục `controllers`, `routes` |
| **Database** | SQLite3 | Lưu ở file `database.sqlite` gốc. Không dùng ORM. |
| **Frontend** | React + Vite + Tailwind CSS | Nằm trong thư mục `src`. Dùng `fetchApi` wrapper. |
| **Auth** | JWT (JSON Web Token) | Header `Authorization: Bearer <token>` |
| **Server/Proxy**| Nginx + PM2 / Docker | Chạy trên VPS VNPT (14.225.172.225) |

---

## II. Cấu trúc Thư mục Trọng yếu

```
Cong_MTTQ_Cam_Pha_Quan_Tri_3.0/
├── backend/                      ← Source code Backend Node.js
│   ├── config/database.js        ← File cấu hình DB và chạy Migration
│   ├── controllers/              ← Logic xử lý API
│   ├── routes/                   ← Định tuyến API
│   └── server.js                 ← Điểm vào (Entry point) của Backend
├── src/                          ← Source code Frontend React
│   ├── components/               ← Các React Component tái sử dụng
│   ├── pages/                    ← Các trang chính (Dashboard, Login,...)
│   └── utils/fetchApi.js         ← Hàm bọc API tùy chỉnh (Quan trọng)
├── .github/workflows/            ← Github Actions tự động deploy
├── mttq_ssl.conf                 ← Cấu hình Nginx HTTPS SSL
└── docker-compose.yml            ← Cấu hình chạy Docker trên VPS
```

---

## III. Các Bài Học Xương Máu (Bloody Lessons) - CẤM TÁI PHẠM

Hệ thống này đã trải qua những pha sập toàn diện vì các lỗi ngớ ngẩn. Các quy tắc sau là **LUẬT THÉP**:

### Quy tắc 1: Không dùng `xss-clean` bừa bãi
- **Vấn đề:** Thư viện `xss-clean` can thiệp và ghi đè trực tiếp vào object `req.query`. Tuy nhiên, ở các phiên bản Node/Express mới, `req.query` chỉ có thuộc tính `getter` (read-only). Nếu dùng sẽ gây Crash Backend (500) ở toàn bộ các API GET có query string.
- **Hành động:** Sử dụng `express-mongo-sanitize` (nếu dùng MongoDB) hoặc tự xử lý sanitize ở cấp độ Controller/Validator bằng các thư viện như `DOMPurify` (ở frontend) hoặc `validator.js`. TUYỆT ĐỐI không dùng `app.use(xss())`.

### Quy tắc 2: Không được bọc lỗi API sơ sài ở Frontend (Swallow Errors)
- **Vấn đề:** Khi bọc hàm `fetch` bằng một custom function (như `fetchApi`), nếu Backend trả về lỗi 500 (dạng HTML) thay vì JSON, hàm bọc không được phép `try/catch` rồi return ra chuỗi hoặc object rỗng. Việc này sẽ khiến Component tiếp tục render với dữ liệu rác, gây ra lỗi Crash Frontend (Trắng màn hình - White Screen of Death) do truy cập vào thuộc tính undefined (vd: `data.find is not a function`).
- **Hành động:** Tại các hàm bọc API chung, nếu `!res.ok`, BẮT BUỘC phải `throw new Error()`. Luôn bọc các Component gọi API bằng Error Boundary để hiển thị lỗi thân thiện thay vì chết trắng màn hình.

### Quy tắc 3: Bắt buộc viết Migration cho SQLite / SQL
- **Vấn đề:** Khi thêm cột mới (ví dụ `cccd`) vào mã tạo bảng `CREATE TABLE IF NOT EXISTS`, SQLite sẽ KHÔNG tự động thêm cột đó vào cơ sở dữ liệu NẾU BẢNG ĐÃ TỒN TẠI. Hậu quả là code chạy trơn tru ở Local (vì hay xóa file `.sqlite`) nhưng sẽ gây lỗi `no such column` ở Production (VPS).
- **Hành động:** Khi có thay đổi Database Schema trên hệ thống đang chạy thật, LUÔN LUÔN phải viết `ALTER TABLE ADD COLUMN` sau block `CREATE TABLE`. 
- **Ví dụ:** `db.run("ALTER TABLE users ADD COLUMN age INTEGER", () => {});` (truyền callback rỗng để bỏ qua lỗi nếu cột đã có).

### Quy tắc 4: Đồng bộ hóa Route Path & HTTP Method giữa Frontend và Backend
- **Vấn đề:** Có 2 lỗi cực kỳ dễ mắc phải gây ra lỗi 404 ngầm: 
  1. Sai đường dẫn: Backend định nghĩa `/api/admin/login` nhưng Frontend lại gọi `/api/auth/login`.
  2. Sai HTTP Method: Frontend gọi lệnh `PUT /petitions/:id/status` nhưng Backend lại định nghĩa bằng `router.patch('/petitions/:id/status')`. (PUT khác với PATCH).
- **Hành động:** Phải có một file cấu hình chung (Constants) chứa mọi endpoint API cho Frontend, hoặc luôn tìm kiếm và kiểm tra mã nguồn Frontend/Backend xem route (đường dẫn) và Method (GET, POST, PUT, PATCH, DELETE) có khớp nhau 100% không trước khi kết luận lỗi mạng. Luôn test API độc lập bằng lệnh `curl`.

### Quy tắc 5: Kiểm tra import CSS (Tránh Dead Code)
- **Vấn đề:** Có những lúc file `index.css` tồn tại nhưng lại không hề được load ở bất cứ đâu (chỉ load `global.css`), dẫn đến việc ngồi code cả tiếng đồng hồ nhưng giao diện không nhận CSS (như sự cố vỡ Desktop View ngày 24/08/2026).
- **Hành động:** TRƯỚC KHI sửa CSS cho bất kỳ component nào, LUÔN dùng grep hoặc tìm kiếm trong file `main.jsx`/`App.jsx` để xác nhận file CSS nào ĐANG ĐƯỢC LOAD THỰC TẾ. Không tin tưởng vào tên file (như `index.css`) nếu chưa kiểm chứng.

---

## IV. Quy tắc Git & Deploy (Conventional Commits)
1. Mọi thay đổi push lên nhánh `main` sẽ kích hoạt **Github Actions Deploy**.
2. **Commit Message:** Tuân thủ Conventional Commits để CI/CD hoạt động mượt mà:
   - `feat:` tính năng mới
   - `fix:` sửa lỗi
   - `chore:` việc vặt, dọn code
   - `refactor:` cấu trúc lại code
3. Quá trình Deploy sẽ build image Docker frontend và backend rồi đẩy lên server qua SSH.
7. KHÔNG bao giờ chạy lệnh `docker-compose down` trên môi trường VPS nếu không hiểu rõ topology, vì có thể tắt nhầm Nginx Reverse Proxy dùng chung với các web app khác (như Lịch Công Tác, Tool Calendar).
5. **Dọn dẹp VPS:** LUÔN đảm bảo kịch bản deploy có bước tự động chạy lệnh `docker image prune -f` để dọn dẹp các image rác (dangling images), tránh việc VPS bị đầy ổ cứng sau nhiều lần cập nhật.
---
**Trạng thái:** KÍCH HOẠT  
**Dự án:** Cổng MTTQ Cẩm Phả
**See also:** [mttq-rule-commit.md](rules/mttq-rule-commit.md) | [mttq-rule-db-migration.md](rules/mttq-rule-db-migration.md) | [mttq-rule-api-error-handling.md](rules/mttq-rule-api-error-handling.md) | [mttq-rule-css-dead-code.md](rules/mttq-rule-css-dead-code.md) | [mttq-workflow-deploy.md](workflows/mttq-workflow-deploy.md)
