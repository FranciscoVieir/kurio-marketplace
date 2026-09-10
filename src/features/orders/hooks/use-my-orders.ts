import {
  useQuery,
} from '@tanstack/react-query'

import {
  getMyOrders,
} from '../api/get-my-orders'

export const myOrdersQueryKey = [
  'me',
  'orders',
] as const

export function useMyOrders() {
  return useQuery({
    queryKey:
      myOrdersQueryKey,

    queryFn:
      getMyOrders,
  })
}