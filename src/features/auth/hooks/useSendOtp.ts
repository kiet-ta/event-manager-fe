import { useMutation } from '@tanstack/react-query'
import { sendOtp } from '../api/send-otp'
import type { SendOtpReq, SendOtpRes } from '../api/schemas'

export function useSendOtp() {
  return useMutation<SendOtpRes, Error, SendOtpReq>({
    mutationFn: sendOtp,
  })
}
