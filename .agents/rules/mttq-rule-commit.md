# Quy tắc Commit Code (Conventional Commits)

Để hệ thống CI/CD (Github Actions) hoạt động trơn tru và lịch sử code rõ ràng, mọi thay đổi phải tuân thủ chuẩn Conventional Commits.

## 1. Định dạng chuẩn
```
<type>(<scope>): <mô tả ngắn gọn>
```

## 2. Các Type được phép sử dụng:
- **feat:** Thêm một tính năng mới (ví dụ: `feat(auth): thêm chức năng quên mật khẩu`).
- **fix:** Sửa một lỗi (ví dụ: `fix(backend): sửa lỗi 500 khi lấy danh sách`).
- **chore:** Các công việc vặt, nâng cấp thư viện, dọn dẹp code không ảnh hưởng logic.
- **refactor:** Cấu trúc lại code nhưng không làm thay đổi hành vi hiện tại.
- **docs:** Cập nhật tài liệu (README, AGENTS.md).
- **style:** Format code, sửa CSS/UI nhỏ.

## 3. Quy tắc Push & Deploy
- Mọi commit push lên nhánh `main` sẽ TỰ ĐỘNG kích hoạt Github Actions deploy lên VPS VNPT.
- Hãy gom (squash) các thay đổi nhỏ lẻ thành một commit có ý nghĩa trước khi push để tránh spam lịch sử và kích hoạt deploy quá nhiều lần.
