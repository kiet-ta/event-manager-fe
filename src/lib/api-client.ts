import {
  clearAuthState,
  getAccessToken,
  setAccessToken,
} from './auth-storage'
import {
  getErrorMessage,
  getRefreshAccessToken,
  parseResponsePayload,
} from './api-response'

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

let refreshPromise: Promise<string | null> | null = null

interface PostJsonOptions<TBody> {
  path: `/${string}`
  body: TBody
  signal?: AbortSignal
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function isAuthPath(path: string) {
  return path.startsWith('/api/v1/auth/')
}

function redirectToLogin() {
  if (!isBrowser()) return
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('Thiếu cấu hình VITE_API_BASE_URL.')
  }

  return baseUrl.replace(/\/+$/, '')
}

async function refreshAccessToken(baseUrl: string): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshUrl = `${baseUrl}/api/v1/auth/refresh`
    const refreshRes = await fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const refreshPayload = await parseResponsePayload(refreshRes)
    if (!refreshRes.ok) {
      return null
    }

    const newAccessToken = getRefreshAccessToken(refreshPayload)
    if (!newAccessToken) {
      return null
    }

    setAccessToken(newAccessToken)
    return newAccessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export async function postJson<TBody>({
  path,
  body,
  signal,
}: PostJsonOptions<TBody>): Promise<unknown> {
  return requestWithRetry({ path, body, signal, hasRetried: false })
}

async function requestWithRetry<TBody>({
  path,
  body,
  signal,
  hasRetried,
}: PostJsonOptions<TBody> & { hasRetried: boolean }): Promise<unknown> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${path}`

  const accessToken = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (accessToken && !isAuthPath(path)) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
    signal,
  })

  const payload = await parseResponsePayload(res)

  if (res.status === 401 && !isAuthPath(path) && !hasRetried) {
    const refreshedAccessToken = await refreshAccessToken(baseUrl)

    if (refreshedAccessToken) {
      return requestWithRetry({ path, body, signal, hasRetried: true })
    }

    clearAuthState()
    redirectToLogin()
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      getErrorMessage(payload, res.status),
      payload,
    )
  }

  return payload
}
