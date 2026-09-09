import { useQuery } from '@tanstack/react-query'

import { getOrder } from '../api/get-order'

export function useOrder(
  orderId: string,
) {
  return useQuery({
    queryKey: [
      'orders',
      orderId,
    ],
    queryFn: () =>
      getOrder(orderId),
    enabled: Boolean(orderId),
  })
}