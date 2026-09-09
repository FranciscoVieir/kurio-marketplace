import type { CheckoutQuote } from '@/features/checkout/types/checkout'

const checkoutQuotes = new Map<
  string,
  CheckoutQuote
>()

export function saveCheckoutQuote(
  quote: CheckoutQuote,
) {
  checkoutQuotes.set(
    quote.quoteId,
    quote,
  )
}

export function getCheckoutQuote(
  quoteId: string,
) {
  return checkoutQuotes.get(quoteId)
}

export function clearCheckoutQuotes() {
  checkoutQuotes.clear()
}