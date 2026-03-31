import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ApiError } from '#/lib/api-client'
import { getAuthErrorMessage } from './getAuthErrorMessage'

describe('getAuthErrorMessage', () => {
  it('returns first zod issue message', () => {
    const schema = z.object({ email: z.string().email('Email không hợp lệ.') })
    const result = schema.safeParse({ email: 'invalid-email' })

    if (result.success) {
      throw new Error('Expected validation to fail')
    }

    const message = getAuthErrorMessage({
      error: result.error,
      fallbackMessage: 'Fallback',
    })

    expect(message).toBe('Email không hợp lệ.')
  })

  it('returns server busy message for 5xx ApiError', () => {
    const message = getAuthErrorMessage({
      error: new ApiError(500, 'Internal error', {}),
      fallbackMessage: 'Fallback',
    })

    expect(message).toBe('Hệ thống đang bận. Vui lòng thử lại sau.')
  })

  it('returns ApiError message for 4xx', () => {
    const message = getAuthErrorMessage({
      error: new ApiError(400, 'Bad request message', {}),
      fallbackMessage: 'Fallback',
    })

    expect(message).toBe('Bad request message')
  })

  it('returns fallback for unknown error', () => {
    const message = getAuthErrorMessage({
      error: null,
      fallbackMessage: 'Fallback message',
    })

    expect(message).toBe('Fallback message')
  })
})
