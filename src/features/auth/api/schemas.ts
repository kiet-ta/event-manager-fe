import { z } from 'zod'

export const sendOtpReqSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc.')
    .max(254, 'Email quá dài.')
    .email('Email không hợp lệ.'),
})

export const sendOtpResSchema = z.object({
  message: z.string().min(1, 'Thiếu message từ server.'),
})

export type SendOtpReq = z.infer<typeof sendOtpReqSchema>
export type SendOtpRes = z.infer<typeof sendOtpResSchema>
