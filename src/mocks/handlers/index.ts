import { authHandlers } from './auth-handlers'
import { checkoutHandlers } from './checkout-handlers'
import { nftHandlers } from './nft-handlers'
import { orderHandlers } from './order-handlers'
import { walletHandlers } from './wallet-handlers'

export const handlers = [
  ...authHandlers,
  ...nftHandlers,
  ...checkoutHandlers,
  ...orderHandlers,
  ...walletHandlers,
]