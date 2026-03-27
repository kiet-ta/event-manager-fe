import { postJson } from '#/lib/api-client'
import { sendOtpReqSchema, sendOtpResSchema } from './schemas'
import type { SendOtpReq, SendOtpRes } from './schemas'

export async function sendOtp(body: SendOtpReq): Promise<SendOtpRes> {
  const validReq = sendOtpReqSchema.parse({
    email: body.email.toLowerCase(),
  })

  const payload = await postJson({
    path: '/api/v1/auth/send-otp',
    body: validReq,
  })

  return sendOtpResSchema.parse(payload)
}
