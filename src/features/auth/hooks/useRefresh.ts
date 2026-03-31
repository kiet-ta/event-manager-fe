import { useMutation } from '@tanstack/react-query'
import { refreshAccessToken } from '../api/refresh'
import type { RefreshRes } from '../api/schemas'

export function useRefresh() {
  return useMutation<RefreshRes, Error, void>({
    mutationFn: () => refreshAccessToken(),
  })
}
