import { authHandlers } from './auth-handlers'

import { checkoutHandlers } from './checkout-handlers'

import { nftHandlers } from './nft-handlers'

import { orderHandlers } from './order-handlers'

import { profileHandlers } from './profile-handlers'

import { scenarioHandlers } from './scenario-handlers'

import { walletHandlers } from './wallet-handlers'

export const handlers = [
  ...scenarioHandlers,

  ...authHandlers,

  ...nftHandlers,

  ...checkoutHandlers,

  ...orderHandlers,

  ...walletHandlers,

  ...profileHandlers,
]