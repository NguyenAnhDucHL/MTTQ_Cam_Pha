# Quy tắc 5: Kiểm tra file CSS được load (Tránh viết Dead Code)

- **Vấn đề:** Trong các dự án có nhiều file CSS (ví dụ `index.css` và `global.css` có nội dung tương tự nhau), rất dễ xảy ra tình trạng viết hàng chục dòng CSS nhưng giao diện không thay đổi hoặc bị vỡ layout trên một thiết bị khác do sửa nhầm vào file không được import. (Ví dụ: `index.css` tồn tại nhưng chỉ `global.css` được import trong `main.jsx`).
- **Hành động:** 
  1. TRƯỚC KHI sửa bất kỳ CSS nào, phải dùng lệnh grep hoặc kiểm tra các file entry (`main.jsx`, `App.jsx`, `index.html`) để xem chính xác file CSS nào ĐANG ĐƯỢC LOAD ở Production.
  2. KHÔNG bao giờ giả định file `index.css` là file chính nếu chưa kiểm tra cây import.
  3. Nếu gặp tình trạng CSS không nhận, hãy nghĩ ngay đến 2 trường hợp: (A) Trình duyệt cache file CSS cũ. (B) Sửa nhầm file CSS rác (dead code).
