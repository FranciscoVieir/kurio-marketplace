import { api } from '@/services/api/client'

import type {
  CreateOrderRequest,
  Order,
} from '../types/checkout'

type CreateOrderParams = {
  payload: CreateOrderRequest
  idempotencyKey: string
}

export async function createOrder({
  payload,
  idempotencyKey,
}: CreateOrderParams) {
  const response = await api.post<Order>(
    '/orders',
    payload,
    {
      headers: {
        'Idempotency-Key':
          idempotencyKey,
      },
    },
  )

  return response.data
}