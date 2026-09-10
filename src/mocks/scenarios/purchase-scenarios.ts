import Decimal from 'decimal.js'

import type {
  CheckoutQuote,
} from '@/features/checkout/types/checkout'
import type {
  Nft,
} from '@/features/nft/types/nft'

import {
  updateNft,
} from '@/mocks/database/nft-database'

import {
  getActiveScenario,
} from './scenario-state'

export function applyPurchaseScenario(
  quote: CheckoutQuote,
): Nft[] {
  const scenario =
    getActiveScenario()

  const firstItem =
    quote.items[0]

  if (!firstItem) {
    return []
  }

  switch (scenario) {
    case 'insufficient-stock': {
      const updatedNft =
        updateNft(
          firstItem.nftId,
          {
            availableQuantity:
              Math.max(
                0,
                firstItem.quantity -
                  1,
              ),
          },
        )

      return updatedNft
        ? [updatedNft]
        : []
    }

    case 'nft-price-changed': {
      const changedPrice =
        new Decimal(
          firstItem.unitPriceEth,
        )
          .plus('0.01')
          .toFixed(2)

      const updatedNft =
        updateNft(
          firstItem.nftId,
          {
            priceEth:
              changedPrice,
          },
        )

      return updatedNft
        ? [updatedNft]
        : []
    }

    case 'nft-version-changed': {
      const updatedNft =
        updateNft(
          firstItem.nftId,
          {
            version:
              firstItem.version +
              1,
          },
        )

      return updatedNft
        ? [updatedNft]
        : []
    }

    default:
      return []
  }
}