import { useMutation } from '@tanstack/react-query'

import { createCheckoutQuote } from '../api/create-checkout-quote'

export function useCheckoutQuote() {
  return useMutation({
    mutationFn: createCheckoutQuote,
  })
}