import Decimal from 'decimal.js'
import {
  http,
  HttpResponse,
} from 'msw'

import type {
  CheckoutQuote,
  CheckoutQuoteRequest,
} from '@/features/checkout/types/checkout'
import type { Nft } from '@/features/nft/types/nft'
import { nftFixtures } from '@/mocks/fixtures/nfts'

import { saveCheckoutQuote } from '../database/checkout-quotes'

const NETWORK_FEE_ETH = '0.016'
const QUOTE_DURATION_MS = 5 * 60 * 1000

const PROMOTIONAL_CODES: Record<
  string,
  string
> = {
  KURIO10: '0.10',
}

function createQuoteId() {
  return `quote_${crypto.randomUUID()}`
}

function isCheckoutQuoteRequest(
  value: unknown,
): value is CheckoutQuoteRequest {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false
  }

  const request =
    value as Record<string, unknown>

  if (!Array.isArray(request.items)) {
    return false
  }

  if (request.items.length === 0) {
    return false
  }

  if (
    request.couponCode !== undefined &&
    typeof request.couponCode !== 'string'
  ) {
    return false
  }

  return request.items.every((item) => {
    if (
      typeof item !== 'object' ||
      item === null
    ) {
      return false
    }

    const quoteItem =
      item as Record<string, unknown>

    return (
      typeof quoteItem.nftId === 'string' &&
      typeof quoteItem.quantity === 'number' &&
      Number.isInteger(
        quoteItem.quantity,
      ) &&
      quoteItem.quantity > 0 &&
      typeof quoteItem.version === 'number' &&
      Number.isInteger(
        quoteItem.version,
      ) &&
      quoteItem.version >= 0
    )
  })
}

function findNft(
  nftId: string,
) {
  return nftFixtures.find(
    (nft) => nft.id === nftId,
  )
}

function getNetwork(
  quoteNfts: Nft[],
) {
  return quoteNfts[0].network
}

export const checkoutHandlers = [
  http.post(
    '/api/checkout/quote',
    async ({ request }) => {
      const body: unknown =
        await request.json()

      if (!isCheckoutQuoteRequest(body)) {
        return HttpResponse.json(
          {
            code: 'INVALID_CHECKOUT_REQUEST',
            message:
              'Os itens enviados para o checkout são inválidos.',
          },
          {
            status: 400,
          },
        )
      }

      const validatedItems: CheckoutQuote['items'] =
        []

      const quoteNfts: Nft[] = []

      for (const requestedItem of body.items) {
        const nft = findNft(
          requestedItem.nftId,
        )

        if (!nft) {
          return HttpResponse.json(
            {
              code: 'NFT_NOT_FOUND',
              message:
                'Um dos NFTs não está mais disponível.',
              nftId:
                requestedItem.nftId,
            },
            {
              status: 404,
            },
          )
        }

        if (
          requestedItem.quantity >
          nft.availableQuantity
        ) {
          return HttpResponse.json(
            {
              code: 'INSUFFICIENT_STOCK',
              message:
                'A quantidade disponível de um dos NFTs foi alterada.',
              nftId: nft.id,
              requestedQuantity:
                requestedItem.quantity,
              availableQuantity:
                nft.availableQuantity,
            },
            {
              status: 409,
            },
          )
        }

        if (
          requestedItem.version !==
          nft.version
        ) {
          return HttpResponse.json(
            {
              code: 'NFT_CHANGED',
              message:
                'Um dos NFTs foi atualizado desde que foi adicionado ao carrinho.',
              nftId: nft.id,
              currentVersion:
                nft.version,
            },
            {
              status: 409,
            },
          )
        }

        const subtotal = new Decimal(
          nft.priceEth,
        ).mul(requestedItem.quantity)

        validatedItems.push({
          nftId: nft.id,
          name: nft.name,
          tokenId: nft.tokenId,
          imageUrl: nft.imageUrl,
          quantity:
            requestedItem.quantity,
          unitPriceEth:
            nft.priceEth,
          subtotalEth:
            subtotal.toFixed(2),
          availableQuantity:
            nft.availableQuantity,
          version: nft.version,
        })

        quoteNfts.push(nft)
      }

      const subtotal =
        validatedItems.reduce(
          (total, item) =>
            total.plus(
              item.subtotalEth,
            ),
          new Decimal(0),
        )

      const normalizedCoupon =
        body.couponCode
          ?.trim()
          .toUpperCase()

      const discountRate =
        normalizedCoupon &&
        PROMOTIONAL_CODES[
          normalizedCoupon
        ]
          ? new Decimal(
              PROMOTIONAL_CODES[
                normalizedCoupon
              ],
            )
          : new Decimal(0)

      const discount =
        subtotal.mul(discountRate)

      const networkFee =
        new Decimal(NETWORK_FEE_ETH)

      const total = subtotal
        .minus(discount)
        .plus(networkFee)

      const now = Date.now()

      const quote: CheckoutQuote = {
        quoteId: createQuoteId(),

        items: validatedItems,

        network: getNetwork(
          quoteNfts,
        ),

        subtotalEth:
          subtotal.toFixed(2),

        discountEth:
          discount.toFixed(2),

        networkFeeEth:
          networkFee.toFixed(3),

        totalEth:
          total.toFixed(3),

        expiresAt: new Date(
          now + QUOTE_DURATION_MS,
        ).toISOString(),
      }

      saveCheckoutQuote(quote)

      return HttpResponse.json(
        quote,
        {
          status: 201,
        },
      )
    },
  ),
]