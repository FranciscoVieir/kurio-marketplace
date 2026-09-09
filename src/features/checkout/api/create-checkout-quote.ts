import { api } from '@/services/api/client'

import type {
  CheckoutQuote,
  CheckoutQuoteRequest,
} from '../types/checkout'

export async function createCheckoutQuote(
  payload: CheckoutQuoteRequest,
) {
  const response = await api.post<CheckoutQuote>(
    '/checkout/quote',
    payload,
  )

  return response.data
}