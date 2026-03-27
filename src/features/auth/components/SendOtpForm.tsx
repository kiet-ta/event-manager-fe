import { useState } from 'react'
import { ZodError } from 'zod'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { ApiError } from '#/lib/api-client'
import { useSendOtp } from '../hooks/useSendOtp'

export function SendOtpForm() {
  const [email, setEmail] = useState('')
  const { mutate, isPending, isSuccess, isError, error, data } = useSendOtp()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutate({ email })
  }

  const getErrorMessage = () => {
    if (!isError) {
      return ''
    }

    if (error instanceof ZodError) {
      return error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.'
    }

    if (error instanceof ApiError) {
      if (error.status >= 500) {
        return 'Hệ thống đang bận. Vui lòng thử lại sau.'
      }

      return error.message
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Gửi OTP thất bại'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        required
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send OTP'}
      </Button>

      {isSuccess && <p className="text-sm text-green-600">{data.message}</p>}
      {isError && <p className="text-sm text-destructive">{getErrorMessage()}</p>}
    </form>
  )
}
