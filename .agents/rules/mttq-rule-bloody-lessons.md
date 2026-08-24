# CÁC BÀI HỌC XƯƠNG MÁU KHI PHÁT TRIỂN HỆ THỐNG MTTQ (Cập nhật 24/08/2026)

Dưới đây là tổng hợp những lỗi "ngớ ngẩn" nhưng gây mất cực kỳ nhiều thời gian (cả ngày trời) mà hệ thống đã gặp phải. BẮT BUỘC AI PHẢI ĐỌC VÀ GHI NHỚ ĐỂ KHÔNG LẶP LẠI:

## 1. Lỗi 413 Payload Too Large (Không tải được ảnh nặng)
- **Triệu chứng:** Frontend báo lỗi network khi upload ảnh > 1MB, mặc dù cấu hình `upload.js` (Multer) trên Node.js đã set max size lên đến 20MB.
- **Nguyên nhân cốt lõi:** Lỗi KHÔNG nằm ở code Backend (Node.js) mà nằm ở **Nginx Reverse Proxy** chạy chung trên VPS. Nginx mặc định giới hạn `client_max_body_size` là 1MB.
- **Bài học:** Khi gặp lỗi upload file thất bại trên server thật (VPS) trong khi test ở localhost vẫn bình thường, việc đầu tiên phải làm là kiểm tra cấu hình Nginx (file `.conf`) và tăng `client_max_body_size 500M;`. 
- **Lưu ý Deploy:** Không dùng `docker-compose down` trên toàn bộ VPS để nạp lại Nginx vì sẽ làm chết các web app khác (Lịch công tác, Tool Calendar) đang chạy chung trên cùng mạng Docker. Phải dùng lệnh `nginx -s reload` bên trong container `nginx-proxy`.

## 2. Lỗi tràn ổ cứng VPS do Docker Image Rác
- **Triệu chứng:** VPS báo đầy dung lượng, quá trình CI/CD fail, không thể kéo được code hay image mới.
- **Nguyên nhân cốt lõi:** Mỗi lần Github Actions build và đẩy image Docker mới lên VPS, các image cũ không tự động biến mất mà trở thành "dangling images" (image rác `<none>`), tích tiểu thành đại chiếm hàng chục GB dung lượng.
- **Bài học:** BẮT BUỘC trong kịch bản deploy (file `deploy.yml`) và trong quy trình chuẩn phải luôn đính kèm lệnh `docker image prune -f` để dọn dẹp các image không còn sử dụng.

## 3. Lỗi 404 Not Found "Ngầm" (Nút Đánh dấu đã giải quyết)
- **Triệu chứng:** Click vào chức năng gọi API thì UI báo "Lỗi hệ thống (404)" qua Toast notification, dù code Backend không crash.
- **Nguyên nhân cốt lõi:** Bất đồng bộ phương thức HTTP. Frontend gọi `fetch` với `method: 'PUT'`, trong khi Backend Express.js lại định nghĩa route bằng `router.patch(...)`. 
- **Bài học:** Đừng chỉ kiểm tra xem đường dẫn (URL) có đúng chính tả không, mà BẮT BUỘC phải soi kỹ **HTTP Method (GET, POST, PUT, PATCH, DELETE)** xem có khớp nhau 100% giữa file component Frontend và file định tuyến Route của Backend hay không. PUT và PATCH là hai phương thức khác biệt, không thể dùng lẫn lộn.

## 4. Lỗi Giao diện Mobile "Không Cánh Mà Bay" (Mất thanh Menu)
- **Triệu chứng:** Khi mở ứng dụng trên điện thoại (Mobile View), thanh Navigation Bar (Menu) biến mất hoàn toàn, chữ Title cũng biến mất, làm Admin không thể thao tác hay chuyển qua lại các tab.
- **Nguyên nhân cốt lõi:** File CSS (`global.css`) đã thiết kế Responsive theo dạng Drawer Menu (Menu trượt ẩn đi ở `left: -300px` và chỉ hiện khi được gắn thêm class `.open`). Tuy nhiên, trong code React (`AdminDashboard.jsx`) lại quên chưa code State đóng/mở và quên code cái nút Hamburger để toggle menu này. Code một đằng, giao diện một nẻo.
- **Bài học:** CSS Responsive định nghĩa logic đóng/mở thì code UI (React Component) BẮT BUỘC phải đi kèm State (`useState`) và nút bấm (`onClick`) tương ứng để điều khiển class CSS đó.

## 5. Lỗi Tồn Đọng Code Rác (Dead Code) Gây Gọi API Thừa
- **Triệu chứng:** Xem trong tab Network của DevTools thấy gọi API 2 lần trùng lặp (ví dụ `/api/admin/petitions`), mặc dù UI vẫn hiển thị bình thường.
- **Nguyên nhân cốt lõi:** Khi refactor code (chuyển logic hiển thị danh sách phản ánh từ `AdminDashboard` sang một component con độc lập là `PetitionList`), Developer đã quên xóa state (`petitions`), hàm fetch (`loadPetitions`), và các hàm xử lý (`handleUpdateStatus`, `handleDelete`) ở component cha. Kết quả là cả cha và con cùng gọi API, cùng lưu state, nhưng state của cha là "Code rác" (Dead Code) không được truyền đi đâu cả.
- **Bài học:** Sau khi tách/refactor component, BẮT BUỘC phải dọn dẹp lại component gốc. Xóa ngay lập tức mọi state, useEffect, và functions không còn được truyền xuống dưới dạng props hoặc không còn dùng để render giao diện.

## 6. Lỗi Giao diện Trống Dữ Liệu (Sai tên trường trả về từ Backend)
- **Triệu chứng:** Danh sách hiển thị ra bảng nhưng cột dữ liệu quan trọng nhất (như Tên đăng nhập) lại trống trơn. Các cột khác thì hiển thị sai dữ liệu mặc định.
- **Nguyên nhân cốt lõi:** Frontend gọi dữ liệu là `account.name` và `account.email`, `account.role`, `account.status`... nhưng Backend (trong file Controller) lại chỉ `SELECT id, username FROM admins`. Hậu quả là Frontend nhận được object `{id: 1, username: 'admin'}` nhưng lại cố gắng render `account.name` (undefined).
- **Bài học:** BẮT BUỘC phải đối chiếu cấu trúc dữ liệu trả về (Data Contract) giữa Backend (`SELECT` cái gì trong DB) và Frontend (chấm `.thuộc_tính` cái gì trong Component). Không bao giờ tự suy diễn cấu trúc object (VD: tự cho rằng user thì có thuộc tính `email`, `name`, `role`) nếu chưa check schema DB và controller.

---
**Nhắc nhở:** Phát triển Web/App không chỉ là code tính năng, mà là "khớp nối" rất nhiều layer với nhau: (CSS <-> Component), (Frontend <-> Backend), (Backend <-> Proxy/Server). Đừng vội vàng!
