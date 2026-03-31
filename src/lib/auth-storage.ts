const ACCESS_TOKEN_KEY = 'auth.accessToken'
const TOKEN_TYPE_KEY = 'auth.tokenType'
const REGISTER_TOKEN_KEY = 'auth.registerToken'
const LEGACY_REFRESH_TOKEN_KEY = 'auth.refreshToken'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function getAccessToken() {
  if (!isBrowser()) return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  if (!isBrowser()) return
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function setTokenType(tokenType: string) {
  if (!isBrowser()) return
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
}

export function setRegisterToken(registerToken: string) {
  if (!isBrowser()) return
  localStorage.setItem(REGISTER_TOKEN_KEY, registerToken)
}

export function persistLoginTokens(accessToken: string, tokenType: string) {
  setAccessToken(accessToken)
  setTokenType(tokenType)
}

export function clearAuthState() {
  if (!isBrowser()) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
  localStorage.removeItem(REGISTER_TOKEN_KEY)
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
}
