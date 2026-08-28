# Website hướng dẫn 6 mô hình kinh doanh

Source code độc lập của website hướng dẫn triển khai 6 mô hình kinh doanh bằng Google Sheets, Google Apps Script và AI.

## Nội dung repository

- Giao diện trang chủ và 6 mô hình
- Nội dung hướng dẫn thao tác theo từng bước
- Trình quản trị nội dung, ảnh và video
- Công cụ khoanh đỏ trực tiếp trên ảnh
- Câu lệnh và các tệp Google Apps Script của từng mô hình
- API lưu hướng dẫn, hình ảnh và video
- Cấu hình xây dựng website

## Chạy trên máy

Yêu cầu Node.js 22.13.0 trở lên.

```bash
pnpm install
pnpm dev
```

## Triển khai Vercel

Import repository vào Vercel và giữ nguyên cấu hình Next.js mặc định. Ảnh, video, tệp mã và tài liệu DOCX cần thiết đều nằm trong `public/`, vì vậy website không phụ thuộc vào repository hoặc deployment cũ.

Để bật trang quản trị `/admin`, cấu hình các biến môi trường:

- `ADMIN_PASSWORD`: mật khẩu quản trị.
- `BLOB_READ_WRITE_TOKEN`: token của Vercel Blob để lưu thay đổi nội dung, ảnh và video.
