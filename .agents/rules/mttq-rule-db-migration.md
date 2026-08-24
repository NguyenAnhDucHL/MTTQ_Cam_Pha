# Quy tắc SQLite Schema Migrations

Trong dự án MTTQ Cẩm Phả, chúng ta sử dụng SQLite với file CSDL gốc `database.sqlite` được lưu trên server production. Vì không sử dụng ORM có tính năng auto-migration mạnh mẽ (như Prisma/Entity Framework), nên phải vô cùng cẩn trọng khi thay đổi schema của database (thêm cột, thêm bảng).

## 1. Bản chất của `CREATE TABLE IF NOT EXISTS`
Đoạn code trong `backend/config/database.js` sử dụng lệnh này:
```sql
CREATE TABLE IF NOT EXISTS petitions (
  id INTEGER PRIMARY KEY,
  ...
)
```
**LƯU Ý:** Nếu bảng `petitions` đã tồn tại, SQLite sẽ **BỎ QUA TOÀN BỘ** câu lệnh này. Việc bạn gõ thêm một cột mới vào câu lệnh CREATE TABLE sẽ không có tác dụng gì trên CSDL đã tồn tại.

## 2. Quy tắc bắt buộc khi thêm cột mới
Mỗi khi thêm một cột mới vào bảng đã có (ví dụ bảng `petitions`, `admins`), **BẮT BUỘC** phải viết thêm lệnh `ALTER TABLE` ở ngay bên dưới.

**Mẫu Code Chuẩn:**
```javascript
// Bước 1: Vẫn cập nhật câu lệnh CREATE TABLE (dành cho việc tạo mới DB từ đầu)
db.run(`
  CREATE TABLE IF NOT EXISTS petitions (
    ...
    newColumn TEXT
  )
`);

// Bước 2: Viết lệnh ALTER TABLE ADD COLUMN cho các DB cũ
// Bắt buộc truyền vào một callback rỗng () => {} để nuốt lỗi (nếu cột đã tồn tại rồi thì SQLite sẽ quăng lỗi, ta sẽ bỏ qua lỗi này).
db.run(`ALTER TABLE petitions ADD COLUMN newColumn TEXT`, () => {});
```

## 3. Hậu quả nếu vi phạm
Vi phạm quy tắc này sẽ dẫn đến lỗi ngầm `no such column` khi gọi API (500 Error), làm Crash hoàn toàn tính năng liên quan trên Production.
