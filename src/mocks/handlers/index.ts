import { checkoutHandlers } from './checkout-handlers'
import { nftHandlers } from './nft-handlers'
import { orderHandlers } from './order-handlers'

export const handlers = [
  ...nftHandlers,
  ...checkoutHandlers,
  ...orderHandlers,
]