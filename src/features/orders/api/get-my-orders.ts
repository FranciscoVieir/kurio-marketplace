import { api } from '@/services/api/client'

import type { Order } from '@/features/checkout/types/checkout'

export async function getMyOrders() {
  const response =
    await api.get<Order[]>(
      '/me/orders',
    )

  return response.data
}