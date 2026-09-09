import {
  http,
  HttpResponse,
} from 'msw'

import type {
  CreateOrderRequest,
  Order,
} from '@/features/checkout/types/checkout'

import { getCheckoutQuote } from '../database/checkout-quotes'
import {
  getOrder,
  getOrderByIdempotencyKey,
  saveOrder,
} from '../database/orders'

function createOrderId() {
  return `order_${crypto.randomUUID()}`
}

function createTransactionHash() {
  const bytes = new Uint8Array(32)

  crypto.getRandomValues(bytes)

  const hash = Array.from(
    bytes,
    (byte) =>
      byte
        .toString(16)
        .padStart(2, '0'),
  ).join('')

  return `0x${hash}`
}

function isCreateOrderRequest(
  value: unknown,
): value is CreateOrderRequest {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false
  }

  const request =
    value as Record<string, unknown>

  if (
    typeof request.quoteId !== 'string' ||
    !request.quoteId.trim()
  ) {
    return false
  }

  if (
    request.walletProvider !== 'metamask' &&
    request.walletProvider !== 'coinbase'
  ) {
    return false
  }

  if (
    typeof request.profile !== 'object' ||
    request.profile === null
  ) {
    return false
  }

  const profile =
    request.profile as Record<string, unknown>

  return (
    typeof profile.displayName === 'string' &&
    Boolean(profile.displayName.trim()) &&
    typeof profile.username === 'string' &&
    Boolean(profile.username.trim()) &&
    (
      profile.network === 'ethereum' ||
      profile.network === 'polygon' ||
      profile.network === 'solana'
    ) &&
    typeof profile.profileName === 'string' &&
    Boolean(profile.profileName.trim()) &&
    typeof profile.walletAddress === 'string' &&
    Boolean(profile.walletAddress.trim()) &&
    typeof profile.walletType === 'string' &&
    Boolean(profile.walletType.trim()) &&
    typeof profile.email === 'string' &&
    Boolean(profile.email.trim()) &&
    typeof profile.useAnotherWallet === 'boolean'
  )
}

export const orderHandlers = [
  http.get(
    '/api/orders/:orderId',
    ({ params }) => {
      const orderId = String(
        params.orderId,
      )

      const order =
        getOrder(orderId)

      if (!order) {
        return HttpResponse.json(
          {
            code: 'ORDER_NOT_FOUND',
            message:
              'Pedido não encontrado.',
          },
          {
            status: 404,
          },
        )
      }

      return HttpResponse.json(
        order,
        {
          status: 200,
        },
      )
    },
  ),

  http.post(
    '/api/orders',
    async ({ request }) => {
      const idempotencyKey =
        request.headers.get(
          'Idempotency-Key',
        )

      if (!idempotencyKey?.trim()) {
        return HttpResponse.json(
          {
            code: 'IDEMPOTENCY_KEY_REQUIRED',
            message:
              'A chave de idempotência é obrigatória.',
          },
          {
            status: 400,
          },
        )
      }

      const existingOrder =
        getOrderByIdempotencyKey(
          idempotencyKey,
        )

      if (existingOrder) {
        return HttpResponse.json(
          existingOrder,
          {
            status: 200,
          },
        )
      }

      const body: unknown =
        await request.json()

      if (!isCreateOrderRequest(body)) {
        return HttpResponse.json(
          {
            code: 'INVALID_ORDER_REQUEST',
            message:
              'Os dados enviados para a compra são inválidos.',
          },
          {
            status: 400,
          },
        )
      }

      const quote =
        getCheckoutQuote(
          body.quoteId,
        )

      if (!quote) {
        return HttpResponse.json(
          {
            code: 'QUOTE_NOT_FOUND',
            message:
              'A cotação informada não existe.',
          },
          {
            status: 404,
          },
        )
      }

      const quoteExpiresAt =
        new Date(
          quote.expiresAt,
        ).getTime()

      if (
        !Number.isFinite(
          quoteExpiresAt,
        ) ||
        quoteExpiresAt <= Date.now()
      ) {
        return HttpResponse.json(
          {
            code: 'QUOTE_EXPIRED',
            message:
              'A cotação expirou. Gere uma nova cotação antes de finalizar a compra.',
          },
          {
            status: 409,
          },
        )
      }

      if (
        body.profile.network !==
        quote.network
      ) {
        return HttpResponse.json(
          {
            code: 'NETWORK_MISMATCH',
            message:
              'A rede selecionada não corresponde à rede da cotação.',
            expectedNetwork:
              quote.network,
            selectedNetwork:
              body.profile.network,
          },
          {
            status: 409,
          },
        )
      }

      const order: Order = {
        id: createOrderId(),

        quoteId: quote.quoteId,

        transactionHash:
          createTransactionHash(),

        status: 'confirmed',

        items: quote.items,

        network: quote.network,

        walletProvider:
          body.walletProvider,

        subtotalEth:
          quote.subtotalEth,

        discountEth:
          quote.discountEth,

        networkFeeEth:
          quote.networkFeeEth,

        totalEth:
          quote.totalEth,

        createdAt:
          new Date().toISOString(),
      }

      saveOrder(
        order,
        idempotencyKey,
      )

      return HttpResponse.json(
        order,
        {
          status: 201,
        },
      )
    },
  ),
]