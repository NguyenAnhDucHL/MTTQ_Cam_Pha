# Quy tắc Bắt lỗi API ở Frontend (Error Handling)

Frontend React của dự án sử dụng hàm tiện ích `fetchApi` (nằm trong `src/utils/fetchApi.js`) để bọc các API call lên Backend. Hàm này xử lý việc thêm Token và thiết lập Headers chung.

## 1. Lỗi phổ biến: "Nuốt lỗi" (Swallow Errors)
Trước đây, hàm `fetchApi` hoặc các đoạn try/catch gọi API thường xử lý lỗi qua loa:
```javascript
// CODE SAI VÀ NGUY HIỂM:
try {
  const res = await fetchApi('/api/data');
  // Nếu res.ok = false, hoặc Backend sập (trả về 500 HTML), hàm này vẫn cứ tiếp tục chạy
} catch (err) {
  return {}; // Hoặc return chuỗi rỗng
}
```

Hậu quả: Component nhận được Object rỗng `{}` thay vì Array hoặc Object đúng chuẩn. Khi Component gọi các hàm như `.find()`, `.map()`, UI sẽ bị **Crash hoàn toàn (White Screen of Death - Trắng tinh màn hình)**.

## 2. Quy tắc bắt buộc
Tại mọi hàm gọi API, nếu phát hiện Backend trả về mã lỗi (`!res.ok`), hoặc parse JSON thất bại, **BẮT BUỘC PHẢI THROW ERROR**.

**Mẫu Code Chuẩn:**
```javascript
const response = await fetch('/mttq-api/admin/petitions');

// Nếu response không OK, ném lỗi ngay lập tức
if (!response.ok) {
    throw new Error('Lỗi từ máy chủ: ' + response.statusText);
}

// Bọc lỗi khi parse JSON (đề phòng Backend trả về HTML 500)
try {
    const data = await response.json();
    return data;
} catch (parseError) {
    throw new Error('Lỗi định dạng dữ liệu từ máy chủ');
}
```

Ở các Component React, luôn xử lý Exception trong khối `catch` bằng cách hiển thị `toast.error()` lịch sự thay vì để Component chết lặng.
