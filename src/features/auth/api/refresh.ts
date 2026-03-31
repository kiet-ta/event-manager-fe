import { postJson } from '#/lib/api-client'
import { refreshResSchema } from './schemas'
import type { RefreshRes } from './schemas'

export async function refreshAccessToken(): Promise<RefreshRes> {
  const payload = await postJson({
    path: '/api/v1/auth/refresh',
    body: {},
  })

  return refreshResSchema.parse(payload)
}
