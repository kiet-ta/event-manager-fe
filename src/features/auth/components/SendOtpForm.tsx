import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useSendOtp } from '../hooks/useSendOtp'
import { getAuthErrorMessage } from '../helpers/getAuthErrorMessage'

export function SendOtpForm() {
  const [email, setEmail] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [formError, setFormError] = useState('')

  const recaptchaEnabled = import.meta.env.VITE_RECAPTCHA_ENABLED === 'true'
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? ''
  const canRenderRecaptcha =
    typeof window !== 'undefined' && recaptchaEnabled && recaptchaSiteKey.length > 0

  const navigate = useNavigate()
  const { mutate, isPending, isSuccess, isError, error, data } = useSendOtp()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')

    if (recaptchaEnabled && recaptchaSiteKey.length === 0) {
      setFormError('Thiếu cấu hình VITE_RECAPTCHA_SITE_KEY.')
      return
    }

    if (recaptchaEnabled && recaptchaToken.length === 0) {
      setFormError('Vui lòng xác thực reCAPTCHA trước khi gửi OTP.')
      return
    }

    mutate(
      {
        email,
        recaptchaToken: recaptchaEnabled ? recaptchaToken : undefined,
      },
      {
        onSuccess: () => {
          const normalizedEmail = email.trim().toLowerCase()
          navigate({
            to: '/verify-otp',
            search: { email: normalizedEmail },
          })
        },
      },
    )
  }

  const getErrorMessage = () => {
    if (formError.length > 0) {
      return formError
    }

    if (!isError) {
      return ''
    }

    return getAuthErrorMessage({
      error,
      fallbackMessage: 'Gửi OTP thất bại.',
    })
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

      {recaptchaEnabled && recaptchaSiteKey.length === 0 && (
        <p className="text-sm text-destructive">
          Thiếu cấu hình reCAPTCHA site key ở frontend.
        </p>
      )}

      {canRenderRecaptcha && (
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={recaptchaSiteKey}
            onChange={(token: string | null) => {
              setRecaptchaToken(token ?? '')
              if (formError.length > 0) {
                setFormError('')
              }
            }}
          />
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send OTP'}
      </Button>

      {isSuccess && <p className="text-sm text-green-600">{data.message}</p>}
      {(formError.length > 0 || isError) && (
        <p className="text-sm text-destructive">{getErrorMessage()}</p>
      )}
    </form>
  )
}
