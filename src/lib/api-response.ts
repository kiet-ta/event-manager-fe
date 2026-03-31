export function getErrorMessage(payload: unknown, status: number) {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0
  ) {
    return payload.message
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string' &&
    payload.error.trim().length > 0
  ) {
    return payload.error
  }

  return `Yêu cầu thất bại (HTTP ${status}).`
}

export async function parseResponsePayload(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return res.json()
  }

  const text = await res.text()
  return text.length > 0 ? text : null
}

export function getRefreshAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  if (!('accessToken' in payload)) return null

  const token = payload.accessToken
  return typeof token === 'string' && token.length > 0 ? token : null
}
