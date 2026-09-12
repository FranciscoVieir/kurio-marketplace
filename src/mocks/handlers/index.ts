import { authHandlers } from './auth-handlers'
import { cartHandlers } from './cart-handlers'
import { checkoutHandlers } from './checkout-handlers'
import { favoritesHandlers } from './favorites-handlers'
import { nftHandlers } from './nft-handlers'
import { orderHandlers } from './order-handlers'
import { profileHandlers } from './profile-handlers'
import { scenarioHandlers } from './scenario-handlers'
import { walletHandlers } from './wallet-handlers'

export const handlers = [
  ...scenarioHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
  ...orderHandlers,
  ...walletHandlers,
  ...profileHandlers,
]
