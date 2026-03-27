# Send OTP Flow – Technical Review Report

## 1) Mục tiêu cải tiến

Báo cáo này tổng hợp các thay đổi đã thực hiện cho luồng `POST /api/v1/auth/send-otp` nhằm đạt các mục tiêu:

- Code rõ ràng, dễ đọc, dễ bảo trì (**clarity**)
- Có nền tảng tốt để mở rộng tính năng (**scalability**)
- Cải thiện độ an toàn khi xử lý lỗi và dữ liệu (**security**)
- Bổ sung kiểm tra dữ liệu ở runtime (**runtime validation**)

---

## 2) Kiến trúc luồng hiện tại

Luồng gửi OTP sau cải tiến:

`SendOtpForm` → `useSendOtp` (React Query mutation) → `sendOtp` → `postJson` (API client) → Backend API

Chi tiết vai trò:

- `src/features/auth/components/SendOtpForm.tsx`
  - Nhận input email, submit form, hiển thị trạng thái gửi OTP.
  - Phân loại lỗi để hiển thị thông báo phù hợp cho người dùng.

- `src/features/auth/hooks/useSendOtp.ts`
  - Khai báo mutation có typing đầy đủ: request, response, error.

- `src/features/auth/api/send-otp.ts`
  - Normalize + validate request.
  - Gọi API qua lớp dùng chung `postJson`.
  - Validate response trước khi trả về UI.

- `src/lib/api-client.ts`
  - Chuẩn hoá logic gọi HTTP.
  - Parse payload theo content-type.
  - Ném `ApiError` có `status`, `payload`, `message` để UI xử lý.

- `src/features/auth/api/schemas.ts`
  - Định nghĩa schema `zod` cho request/response của send-otp.

---

## 3) Danh sách cải tiến đã làm

## 3.1 Shared API client (`src/lib/api-client.ts`)

Đã tạo abstraction `postJson` với các lợi ích:

- Tránh lặp code `fetch + headers + parse + error`.
- Tập trung xử lý lỗi HTTP một nơi duy nhất.
- Tạo `ApiError` có ngữ cảnh đầy đủ (`status`, `payload`) để UI map lỗi chính xác.

Ý nghĩa cho scale:

- Endpoint mới (verify-otp, resend-otp, login...) có thể tái sử dụng cùng pattern.

## 3.2 Runtime validation bằng `zod` (`src/features/auth/api/schemas.ts`)

Request schema:

- `email`: bắt buộc, trim, max 254 ký tự, đúng định dạng email.

Response schema:

- `message`: bắt buộc, không rỗng.

Ý nghĩa:

- TypeScript chỉ kiểm tra ở compile-time.
- `zod` kiểm tra runtime để chặn dữ liệu API sai contract.

## 3.3 Harden `sendOtp` (`src/features/auth/api/send-otp.ts`)

Thay đổi chính:

- Normalize email về lowercase.
- Validate request trước khi gửi (`sendOtpReqSchema.parse`).
- Gọi API qua `postJson`.
- Validate response trước khi trả về UI (`sendOtpResSchema.parse`).

Ý nghĩa:

- Không “tin tưởng mù quáng” dữ liệu từ bên ngoài.
- Nếu backend trả sai shape, lỗi xảy ra sớm và rõ ràng.

## 3.4 Typing mutation rõ ràng (`src/features/auth/hooks/useSendOtp.ts`)

Đã dùng generic đầy đủ:

- `useMutation<SendOtpRes, Error, SendOtpReq>`

Ý nghĩa:

- Tăng độ an toàn kiểu dữ liệu.
- IDE hỗ trợ tốt hơn khi dùng `data`, `error`, `mutate`.

## 3.5 Safe error mapping trong UI (`src/features/auth/components/SendOtpForm.tsx`)

Chiến lược hiển thị lỗi:

- `ZodError`: báo lỗi nhập liệu.
- `ApiError`:
  - `status >= 500`: trả message generic, không lộ nội bộ hệ thống.
  - `status < 500`: dùng message nghiệp vụ từ server.
- Fallback mặc định khi không xác định được lỗi.

Ý nghĩa:

- Trải nghiệm người dùng tốt hơn.
- Giảm nguy cơ lộ thông tin kỹ thuật nhạy cảm.

## 3.6 Hydration warning khi chạy dev (`src/routes/__root.tsx`)

Đã thêm:

- `<html suppressHydrationWarning>`

Lý do:

- Cảnh báo mismatch thường do extension/browser inject attribute vào HTML trước khi React hydrate (vd `--vsc-domain`).

---

## 4) Khái niệm kỹ thuật cốt lõi đã áp dụng

## 4.1 Separation of Concerns

Tách rõ UI / hook / API / schema / core client để mỗi lớp có trách nhiệm riêng.

## 4.2 Compile-time vs Runtime Safety

- Compile-time: TypeScript
- Runtime: `zod`

Cần cả hai để an toàn dữ liệu end-to-end.

## 4.3 Contract-driven API

API contract (request/response) được định nghĩa và enforce bằng schema, không chỉ bằng type.

## 4.4 Defensive Error Handling

Không hiển thị trực tiếp mọi lỗi raw; map lỗi theo ngữ cảnh và mức độ an toàn.

## 4.5 Reusability for Scale

`postJson` là điểm tái sử dụng nền cho mọi API call sau này.

---

## 5) Đánh giá sau cải tiến

## 5.1 Clarity

- Tốt hơn đáng kể do tách lớp rõ ràng.

## 5.2 Scalability

- Có nền API client dùng chung và schema-based flow.
- Dễ nhân rộng sang các endpoint auth khác.

## 5.3 Security (phạm vi frontend)

- Có validation runtime request/response.
- Có safe error message cho lỗi hệ thống.
- Giảm nguy cơ hiển thị thông tin nội bộ.

Lưu ý:

- OTP abuse protection (rate limit, captcha, cooldown, lockout) phải enforce ở backend.

---

## 6) Validation & verification đã chạy

Đã chạy và pass:

- `npm run lint`
- `npm run test`
- `npm run build`

---

## 7) File thay đổi chính

- `src/lib/api-client.ts` (new)
- `src/features/auth/api/schemas.ts` (new)
- `src/features/auth/api/send-otp.ts`
- `src/features/auth/hooks/useSendOtp.ts`
- `src/features/auth/components/SendOtpForm.tsx`
- `src/routes/__root.tsx`
- `package.json` (thêm `zod`)

---

## 8) Đề xuất bước tiếp theo

- Thêm `api-error-mapper.ts` dùng chung toàn app (map theo status/code).
- Thêm timeout/retry policy cho API client.
- Thêm unit test cho:
  - schema validation
  - `sendOtp` API function
  - `SendOtpForm` behavior (success/error states)
- Backend bổ sung rate-limit/captcha/cooldown cho endpoint OTP.
