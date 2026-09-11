import {
  delay,
  http,
  HttpResponse,
} from 'msw'

import type {
  CreateOrderRequest,
  Order,
} from '@/features/checkout/types/checkout'

import {
  commitNftPurchase,
} from '@/mocks/database/nft-database'

import {
  deleteSession,
  getActiveSession,
  isSessionExpired,
} from '@/mocks/database/sessions'

import {
  getUserById,
} from '@/mocks/database/users'

import {
  emitNftUpdated,
  emitOrderUpdated,
} from '@/mocks/socket/realtime'

import {
  applyPurchaseScenario,
} from '@/mocks/scenarios/purchase-scenarios'

import {
  isScenarioActive,
} from '@/mocks/scenarios/scenario-state'

import {
  getCheckoutQuote,
} from '../database/checkout-quotes'

import {
  getIdempotencyRecord,
  getOrderForUser,
  getOrdersByUserId,
  saveOrder,
  updateOrder,
} from '../database/orders'

const ORDER_CONFIRMATION_DELAY_MS =
  1800

/*
 * O Axios do frontend possui timeout de 10s.
 *
 * Neste cenário o backend aceita/persiste a
 * operação antes de atrasar a resposta por
 * tempo suficiente para o cliente abortar.
 */
const PAYMENT_TIMEOUT_RESPONSE_DELAY_MS =
  11_000

function createOrderId() {
  return `order_${crypto.randomUUID()}`
}

function createRequestSignature(
  request: CreateOrderRequest,
) {
  return JSON.stringify({
    quoteId:
      request.quoteId,

    walletProvider:
      request.walletProvider,

    profile: {
      displayName:
        request.profile.displayName,

      username:
        request.profile.username,

      network:
        request.profile.network,

      profileName:
        request.profile.profileName,

      walletAddress:
        request.profile.walletAddress,

      walletType:
        request.profile.walletType,

      email:
        request.profile.email,

      useAnotherWallet:
        request.profile.useAnotherWallet,
    },
  })
}

function createTransactionHash() {
  const bytes =
    new Uint8Array(32)

  crypto.getRandomValues(
    bytes,
  )

  const hash =
    Array.from(
      bytes,
      (byte) =>
        byte
          .toString(16)
          .padStart(
            2,
            '0',
          ),
    ).join('')

  return `0x${hash}`
}

function getAuthenticatedUserId() {
  const session =
    getActiveSession()

  if (!session) {
    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'UNAUTHENTICATED',

            message:
              'Você precisa estar autenticado para acessar pedidos.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  if (
    isSessionExpired(
      session,
    )
  ) {
    deleteSession(
      session.id,
    )

    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'SESSION_EXPIRED',

            message:
              'Sua sessão expirou. Entre novamente para continuar.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  const user =
    getUserById(
      session.userId,
    )

  if (!user) {
    deleteSession(
      session.id,
    )

    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'INVALID_SESSION',

            message:
              'A sessão atual não está mais associada a um usuário válido.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  return {
    ok: true as const,

    userId:
      user.id,
  }
}

function isCreateOrderRequest(
  value: unknown,
): value is CreateOrderRequest {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const request =
    value as Record<
      string,
      unknown
    >

  if (
    typeof request.quoteId !==
      'string' ||
    !request.quoteId.trim()
  ) {
    return false
  }

  if (
    request.walletProvider !==
      'metamask' &&
    request.walletProvider !==
      'coinbase'
  ) {
    return false
  }

  if (
    typeof request.profile !==
      'object' ||
    request.profile ===
      null
  ) {
    return false
  }

  const profile =
    request.profile as Record<
      string,
      unknown
    >

  return (
    typeof profile.displayName ===
      'string' &&
    Boolean(
      profile.displayName.trim(),
    ) &&

    typeof profile.username ===
      'string' &&
    Boolean(
      profile.username.trim(),
    ) &&

    (
      profile.network ===
        'ethereum' ||
      profile.network ===
        'polygon' ||
      profile.network ===
        'solana'
    ) &&

    typeof profile.profileName ===
      'string' &&
    Boolean(
      profile.profileName.trim(),
    ) &&

    typeof profile.walletAddress ===
      'string' &&
    Boolean(
      profile.walletAddress.trim(),
    ) &&

    typeof profile.walletType ===
      'string' &&
    Boolean(
      profile.walletType.trim(),
    ) &&

    typeof profile.email ===
      'string' &&
    Boolean(
      profile.email.trim(),
    ) &&

    typeof profile.useAnotherWallet ===
      'boolean'
  )
}

function createPurchaseErrorResponse(
  result: Exclude<
    ReturnType<
      typeof commitNftPurchase
    >,
    {
      ok: true
    }
  >,
) {
  switch (
    result.code
  ) {
    case 'NFT_NOT_FOUND':
      return HttpResponse.json(
        {
          code:
            'NFT_NOT_FOUND',

          message:
            'Um dos NFTs da cotação não está mais disponível.',

          nftId:
            result.nftId,
        },
        {
          status: 404,
        },
      )

    case 'INSUFFICIENT_STOCK':
      return HttpResponse.json(
        {
          code:
            'INSUFFICIENT_STOCK',

          message:
            'A quantidade disponível de um dos NFTs foi alterada antes da confirmação da compra.',

          nftId:
            result.nftId,

          requestedQuantity:
            result.requestedQuantity,

          availableQuantity:
            result.availableQuantity,
        },
        {
          status: 409,
        },
      )

    case 'NFT_CHANGED':
      return HttpResponse.json(
        {
          code:
            'NFT_CHANGED',

          message:
            'Um dos NFTs foi atualizado após a criação da cotação.',

          nftId:
            result.nftId,

          quotedVersion:
            result.expectedVersion,

          currentVersion:
            result.currentVersion,
        },
        {
          status: 409,
        },
      )

    case 'NFT_PRICE_CHANGED':
      return HttpResponse.json(
        {
          code:
            'NFT_PRICE_CHANGED',

          message:
            'O preço de um dos NFTs foi alterado após a criação da cotação.',

          nftId:
            result.nftId,

          quotedPrice:
            result.expectedPriceEth,

          currentPrice:
            result.currentPriceEth,
        },
        {
          status: 409,
        },
      )
  }
}

function confirmPendingOrder(
  order: Order,
) {
  if (
    order.status !==
    'pending'
  ) {
    return order
  }

  const confirmedOrder =
    updateOrder(
      order.id,
      {
        status:
          'confirmed',
      },
    )

  if (!confirmedOrder) {
    return order
  }

  emitOrderUpdated({
    order:
      confirmedOrder,
  })

  return confirmedOrder
}

function reconcilePendingOrder(
  order: Order,
) {
  if (
    order.status !==
    'pending'
  ) {
    return order
  }

  const createdAt =
    new Date(
      order.createdAt,
    ).getTime()

  if (
    !Number.isFinite(
      createdAt,
    )
  ) {
    return order
  }

  if (
    Date.now() <
    createdAt +
      ORDER_CONFIRMATION_DELAY_MS
  ) {
    return order
  }

  return confirmPendingOrder(
    order,
  )
}

function scheduleOrderConfirmation(
  orderId: string,
  userId: string,
) {
  window.setTimeout(
    () => {
      const order =
        getOrderForUser(
          orderId,
          userId,
        )

      if (!order) {
        return
      }

      confirmPendingOrder(
        order,
      )
    },
    ORDER_CONFIRMATION_DELAY_MS,
  )
}

export const orderHandlers = [
  http.get(
    '/api/me/orders',
    () => {
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const orders =
        getOrdersByUserId(
          auth.userId,
        ).map(
          reconcilePendingOrder,
        )

      return HttpResponse.json(
        orders,
        {
          status: 200,
        },
      )
    },
  ),

  http.get(
    '/api/orders/:orderId',
    ({
      params,
    }) => {
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const orderId =
        String(
          params.orderId,
        )

      const storedOrder =
        getOrderForUser(
          orderId,
          auth.userId,
        )

      const order =
        storedOrder
          ? reconcilePendingOrder(
              storedOrder,
            )
          : null

      /*
       * Retornamos 404 tanto para
       * pedido inexistente quanto
       * para pedido de outro usuário.
       *
       * Dessa forma, uma conta não
       * consegue descobrir se um ID
       * pertence a outra conta.
       */
      if (!order) {
        return HttpResponse.json(
          {
            code:
              'ORDER_NOT_FOUND',

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
    async ({
      request,
    }) => {
      /*
       * AUTHENTICATION
       *
       * O userId nunca é recebido
       * diretamente do frontend.
       *
       * O owner vem exclusivamente
       * da sessão autenticada.
       */
      const auth =
        getAuthenticatedUserId()

      if (!auth.ok) {
        return auth.response
      }

      const idempotencyKey =
        request.headers.get(
          'Idempotency-Key',
        )

      if (
        !idempotencyKey?.trim()
      ) {
        return HttpResponse.json(
          {
            code:
              'IDEMPOTENCY_KEY_REQUIRED',

            message:
              'A chave de idempotência é obrigatória.',
          },
          {
            status: 400,
          },
        )
      }

      const body: unknown =
        await request.json()

      if (
        !isCreateOrderRequest(
          body,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_ORDER_REQUEST',

            message:
              'Os dados enviados para a compra são inválidos.',
          },
          {
            status: 400,
          },
        )
      }

      /*
       * IDEMPOTENCY
       *
       * A chave fica isolada por usuário
       * e vinculada ao conteúdo da tentativa.
       *
       * Mesma chave + mesmo conteúdo:
       * retorna exatamente o mesmo pedido.
       *
       * Mesma chave + conteúdo diferente:
       * conflito, sem criar outra compra.
       */
      const requestSignature =
        createRequestSignature(
          body,
        )

      const idempotencyRecord =
        getIdempotencyRecord(
          auth.userId,
          idempotencyKey,
        )

      if (
        idempotencyRecord
      ) {
        if (
          idempotencyRecord.requestSignature !==
            null &&
          idempotencyRecord.requestSignature !==
            requestSignature
        ) {
          return HttpResponse.json(
            {
              code:
                'IDEMPOTENCY_CONFLICT',

              message:
                'A chave de idempotência já foi utilizada com dados diferentes.',
            },
            {
              status: 409,
            },
          )
        }

        return HttpResponse.json(
          reconcilePendingOrder(
            idempotencyRecord.order,
          ),
          {
            status: 200,
          },
        )
      }

      /*
       * QUOTE
       */
      const quote =
        getCheckoutQuote(
          body.quoteId,
        )

      if (!quote) {
        return HttpResponse.json(
          {
            code:
              'QUOTE_NOT_FOUND',

            message:
              'A cotação informada não existe.',
          },
          {
            status: 404,
          },
        )
      }

      /*
       * QUOTE EXPIRATION
       */
      const quoteExpiresAt =
        new Date(
          quote.expiresAt,
        ).getTime()

      if (
        !Number.isFinite(
          quoteExpiresAt,
        ) ||
        quoteExpiresAt <=
          Date.now()
      ) {
        return HttpResponse.json(
          {
            code:
              'QUOTE_EXPIRED',

            message:
              'A cotação expirou. Gere uma nova cotação antes de finalizar a compra.',
          },
          {
            status: 409,
          },
        )
      }

      /*
       * NETWORK
       */
      if (
        body.profile.network !==
        quote.network
      ) {
        return HttpResponse.json(
          {
            code:
              'NETWORK_MISMATCH',

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

      /*
       * PAYMENT REFUSED
       *
       * A recusa acontece antes de qualquer
       * baixa de estoque ou criação de pedido.
       *
       * O frontend recebe uma falha definitiva
       * e mantém o carrinho intacto.
       */
      if (
        isScenarioActive(
          'payment-refused',
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'PAYMENT_REFUSED',

            message:
              'O pagamento foi recusado pela carteira. Revise os dados ou tente novamente.',
          },
          {
            status: 402,
          },
        )
      }

      /*
 * DETERMINISTIC PURCHASE SCENARIOS
 *
 * Em cenários de teste podemos
 * simular uma alteração externa no
 * NFT depois que a quote foi criada
 * e antes do commit da compra.
 *
 * A regra real de negócio continua
 * sendo validada exclusivamente por
 * commitNftPurchase().
 */
const scenarioUpdatedNfts =
  applyPurchaseScenario(
    quote,
  )

/*
 * A alteração simulada representa
 * uma mudança externa no marketplace.
 *
 * Por isso também publicamos
 * nft.updated para outras telas
 * abertas reagirem em realtime.
 */
for (
  const updatedNft of
    scenarioUpdatedNfts
) {
  emitNftUpdated({
    nft: updatedNft,
  })
}

      /*
       * ATOMIC NFT PURCHASE
       *
       * A quote é apenas um snapshot.
       *
       * No momento da compra,
       * preço, versão e estoque são
       * novamente validados antes
       * da baixa atômica.
       */
      const purchaseResult =
        commitNftPurchase(
          quote.items.map(
            (item) => ({
              nftId:
                item.nftId,

              quantity:
                item.quantity,

              expectedVersion:
                item.version,

              expectedPriceEth:
                item.unitPriceEth,
            }),
          ),
        )

      if (
        !purchaseResult.ok
      ) {
        return createPurchaseErrorResponse(
          purchaseResult,
        )
      }

      /*
       * ORDER
       *
       * Neste ponto a compra foi
       * aceita pelo mock backend,
       * mas a transação ainda está
       * aguardando confirmação.
       */
      const order: Order = {
        id:
          createOrderId(),

        userId:
          auth.userId,

        quoteId:
          quote.quoteId,

        transactionHash:
          createTransactionHash(),

        status:
          'pending',

        /*
         * Versão inicial do recurso.
         *
         * updateOrder() incrementa a
         * versão a cada alteração
         * persistida, permitindo que
         * order.updated rejeite eventos
         * antigos ou duplicados.
         */
        version: 1,

        items:
          quote.items,

        network:
          quote.network,

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

      /*
       * Primeiro persistimos o pedido.
       *
       * Isso garante que qualquer
       * GET subsequente já enxergue
       * o status pending.
       */
      saveOrder(
        order,
        idempotencyKey,
        requestSignature,
      )

      /*
       * O commitNftPurchase devolve
       * exatamente os NFTs persistidos
       * após a compra.
       *
       * Esses eventos são públicos:
       * qualquer tela que esteja
       * exibindo esses NFTs poderá
       * reagir ao novo estoque/versão.
       */
      for (
        const updatedNft of
        purchaseResult.updatedNfts
      ) {
        emitNftUpdated({
          nft:
            updatedNft,
        })
      }

      /*
       * PAYMENT TIMEOUT
       *
       * O pedido e a chave de idempotência
       * já foram persistidos, e a compra já
       * foi aplicada uma única vez.
       *
       * A primeira resposta simula um timeout
       * do gateway. Como o registro idempotente
       * já existe, uma nova tentativa com a
       * mesma chave retorna exatamente este
       * mesmo pedido sem repetir a compra.
       */
      if (
        isScenarioActive(
          'payment-timeout',
        )
      ) {
        scheduleOrderConfirmation(
          order.id,
          auth.userId,
        )

        /*
         * O pedido já existe neste ponto.
         *
         * A resposta HTTP é deliberadamente
         * atrasada além do timeout de 10s do
         * Axios. Assim, quem falha é o cliente
         * por timeout real — não o backend com
         * um 504 artificial.
         *
         * Se o usuário tentar novamente, o
         * bloco de idempotência no início deste
         * handler encontra a mesma chave e
         * devolve o mesmo pedido imediatamente,
         * sem executar commitNftPurchase() de
         * novo.
         */
        await delay(
          PAYMENT_TIMEOUT_RESPONSE_DELAY_MS,
        )

        return HttpResponse.json(
          order,
          {
            status: 201,
          },
        )
      }

      /*
       * A confirmação acontece
       * posteriormente no mock backend.
       *
       * A UI NÃO altera o status
       * diretamente.
       */
      scheduleOrderConfirmation(
        order.id,
        auth.userId,
      )

      /*
       * O HTTP retorna o recurso
       * inicialmente em pending.
       *
       * A confirmação posterior
       * chegará pelo Socket.IO.
       */
      return HttpResponse.json(
        order,
        {
          status: 201,
        },
      )
    },
  ),
]