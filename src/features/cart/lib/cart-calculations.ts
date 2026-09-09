import Decimal from 'decimal.js'

import type { CartItem } from '../types/cart'

export function calculateCartItemTotal(
  item: CartItem,
): string {
  return new Decimal(item.priceEth)
    .mul(item.quantity)
    .toFixed(2)
}

export function calculateCartSubtotal(
  items: CartItem[],
): string {
  return items
    .reduce(
      (total, item) =>
        total.plus(
          new Decimal(item.priceEth).mul(
            item.quantity,
          ),
        ),
      new Decimal(0),
    )
    .toFixed(2)
}