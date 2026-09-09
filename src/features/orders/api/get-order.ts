import { api } from '@/services/api/client'

import type { Order } from '@/features/checkout/types/checkout'

export async function getOrder(
  orderId: string,
) {
  const response = await api.get<Order>(
    `/orders/${orderId}`,
  )

  return response.data
}