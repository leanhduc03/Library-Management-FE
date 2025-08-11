# Library Management System - Frontend

Đây là phần Frontend của hệ thống quản lý thư viện, được xây dựng bằng React và TypeScript.

## Cài đặt

```bash
# Di chuyển vào thư mục frontend
cd fe

# Cài đặt các dependencies
npm install

# Khởi chạy ứng dụng ở chế độ development
npm start
```

## Cấu trúc thư mục

- `src/components`: Các components có thể tái sử dụng
- `src/pages`: Các trang trong ứng dụng
- `src/services`: Các service để gọi API
- `src/models`: Các model dữ liệu
- `src/context`: Context API cho quản lý trạng thái toàn cục
- `src/utils`: Các utility functions

## Chức năng

- **Đăng nhập/Đăng ký**: Người dùng có thể đăng ký tài khoản mới và đăng nhập.
- **Xem danh sách sách**: Hiển thị tất cả sách trong thư viện.
- **Tìm kiếm và lọc**: Tìm kiếm sách theo tên, tác giả và lọc theo thể loại.
- **Mượn sách**: Người dùng có thể mượn sách từ thư viện.
- **Xem sách đã mượn**: Người dùng có thể xem danh sách sách đã mượn và trạng thái.
- **Trả sách**: Người dùng có thể đánh dấu sách là đã trả.
- **Quản lý sách** (Admin): Thêm, sửa sách.
- **Quản lý người dùng** (Admin): Xem danh sách người dùng và phân quyền.

## Phân quyền

- **Người dùng thông thường**: Có thể xem sách, mượn sách, xem sách đã mượn, trả sách, xem khoản nợ.
- **Quản trị viên**: Có tất cả quyền của người dùng thông thường cộng thêm quyền quản lý sách và người dùng, xem và xác nhận thanh toán khoản nợ.
