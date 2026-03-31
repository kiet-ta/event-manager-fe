import { ZodError } from 'zod'
import { ApiError } from '#/lib/api-client'

interface GetAuthErrorMessageOptions {
  error: unknown
  fallbackMessage: string
  serverBusyMessage?: string
}

export function getAuthErrorMessage({
  error,
  fallbackMessage,
  serverBusyMessage = 'Hệ thống đang bận. Vui lòng thử lại sau.',
}: GetAuthErrorMessageOptions): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.'
  }

  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return serverBusyMessage
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
