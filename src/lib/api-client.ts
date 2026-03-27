export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

interface PostJsonOptions<TBody> {
  path: `/${string}`
  body: TBody
  signal?: AbortSignal
}

function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('Thiếu cấu hình VITE_API_BASE_URL.')
  }

  return baseUrl.replace(/\/+$/, '')
}

function getErrorMessage(payload: unknown, status: number) {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0
  ) {
    return payload.message
  }

  return `Yêu cầu thất bại (HTTP ${status}).`
}

async function parseResponsePayload(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return res.json()
  }

  const text = await res.text()
  return text.length > 0 ? text : null
}

export async function postJson<TBody>({
  path,
  body,
  signal,
}: PostJsonOptions<TBody>): Promise<unknown> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })

  const payload = await parseResponsePayload(res)

  if (!res.ok) {
    throw new ApiError(res.status, getErrorMessage(payload, res.status), payload)
  }

  return payload
}
