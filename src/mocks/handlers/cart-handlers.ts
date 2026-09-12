import {
  http,
  HttpResponse,
} from 'msw'

import type {
  CartItem,
  CartState,
} from '@/features/cart/types/cart'
import {
  clearStoredCart,
  loadCart,
  mergeCarts,
  saveCart,
} from '@/features/cart/lib/cart-storage'
import {
  getNftById,
} from '@/mocks/database/nft-database'
import {
  deleteSession,
  getActiveSession,
  isSessionExpired,
} from '@/mocks/database/sessions'
import {
  getUserById,
} from '@/mocks/database/users'

const GUEST_OWNER_ID =
  'guest'

type CartOwnerResult =
  | {
      ok: true
      ownerId: string
    }
  | {
      ok: false
      response: Response
    }

type AddCartItemRequest = {
  nftId: string
  quantity: number
}

type UpdateCartItemRequest = {
  quantity: number
}

type UpdateCartCouponRequest = {
  couponCode: string | null
}

function resolveCartOwner(): CartOwnerResult {
  const session =
    getActiveSession()

  /*
   * O carrinho pode ser utilizado
   * por visitantes. A ausência de
   * sessão representa o owner guest.
   */
  if (!session) {
    return {
      ok: true,
      ownerId:
        GUEST_OWNER_ID,
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
      ok: false,

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
      ok: false,

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
    ok: true,
    ownerId:
      user.id,
  }
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    typeof value ===
      'number' &&
    Number.isInteger(
      value,
    ) &&
    value > 0
  )
}

function isAddCartItemRequest(
  value: unknown,
): value is AddCartItemRequest {
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

  return (
    typeof request.nftId ===
      'string' &&
    Boolean(
      request.nftId.trim(),
    ) &&
    isPositiveInteger(
      request.quantity,
    )
  )
}

function isUpdateCartItemRequest(
  value: unknown,
): value is UpdateCartItemRequest {
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

  return isPositiveInteger(
    request.quantity,
  )
}

function isUpdateCartCouponRequest(
  value: unknown,
): value is UpdateCartCouponRequest {
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

  return (
    request.couponCode ===
      null ||
    typeof request.couponCode ===
      'string'
  )
}

function toCartItem(
  nft: NonNullable<
    ReturnType<
      typeof getNftById
    >
  >,
  quantity: number,
): CartItem {
  return {
    nftId:
      nft.id,

    name:
      nft.name,

    imageUrl:
      nft.imageUrl,

    collection:
      nft.collection,

    network:
      nft.network,

    priceEth:
      nft.priceEth,

    quantity,

    availableQuantity:
      nft.availableQuantity,

    version:
      nft.version,
  }
}

function getCartForOwner(
  ownerId: string,
) {
  /*
   * No primeiro acesso autenticado,
   * o carrinho guest é mesclado no
   * carrinho privado e depois limpo.
   *
   * A operação é segura para repetir:
   * após o primeiro merge, o carrinho
   * guest fica vazio.
   */
  const cart =
    ownerId ===
    GUEST_OWNER_ID
      ? loadCart(
          ownerId,
        )
      : mergeCarts(
          GUEST_OWNER_ID,
          ownerId,
        )

  return reconcileCart(
    ownerId,
    cart,
  )
}

function reconcileCart(
  ownerId: string,
  cart: CartState,
) {
  const items =
    cart.items.flatMap(
      (
        item,
      ) => {
        const nft =
          getNftById(
            item.nftId,
          )

        if (
          !nft ||
          nft.availableQuantity <=
            0
        ) {
          return []
        }

        return [
          toCartItem(
            nft,
            Math.min(
              item.quantity,
              nft.availableQuantity,
            ),
          ),
        ]
      },
    )

  const reconciledCart: CartState = {
    items,

    couponCode:
      cart.couponCode,
  }

  saveCart(
    ownerId,
    reconciledCart,
  )

  return reconciledCart
}

function validationError(
  message: string,
) {
  return HttpResponse.json(
    {
      code:
        'VALIDATION_ERROR',

      message,
    },
    {
      status: 400,
    },
  )
}

function notFoundError(
  message: string,
) {
  return HttpResponse.json(
    {
      code:
        'NOT_FOUND',

      message,
    },
    {
      status: 404,
    },
  )
}

function availabilityConflict(
  nftId: string,
  requestedQuantity: number,
  availableQuantity: number,
) {
  return HttpResponse.json(
    {
      code:
        'INSUFFICIENT_STOCK',

      message:
        'A quantidade solicitada não está disponível para este NFT.',

      nftId,

      requestedQuantity,

      availableQuantity,
    },
    {
      status: 409,
    },
  )
}

export const cartHandlers = [
  http.get(
    '/api/cart',
    () => {
      const owner =
        resolveCartOwner()

      if (!owner.ok) {
        return owner.response
      }

      return HttpResponse.json(
        getCartForOwner(
          owner.ownerId,
        ),
        {
          status: 200,
        },
      )
    },
  ),

  http.post(
    '/api/cart/items',
    async ({
      request,
    }) => {
      const owner =
        resolveCartOwner()

      if (!owner.ok) {
        return owner.response
      }

      const body: unknown =
        await request.json()

      if (
        !isAddCartItemRequest(
          body,
        )
      ) {
        return validationError(
          'Informe um NFT válido e uma quantidade inteira maior que zero.',
        )
      }

      const nft =
        getNftById(
          body.nftId,
        )

      if (!nft) {
        return notFoundError(
          'NFT não encontrado.',
        )
      }

      const currentCart =
        getCartForOwner(
          owner.ownerId,
        )

      const existingItem =
        currentCart.items.find(
          (
            item,
          ) =>
            item.nftId ===
            nft.id,
        )

      const nextQuantity =
        (
          existingItem?.quantity ??
          0
        ) +
        body.quantity

      if (
        nextQuantity >
        nft.availableQuantity
      ) {
        return availabilityConflict(
          nft.id,
          nextQuantity,
          nft.availableQuantity,
        )
      }

      const nextItem =
        toCartItem(
          nft,
          nextQuantity,
        )

      const nextCart: CartState = {
        ...currentCart,

        items:
          existingItem
            ? currentCart.items.map(
                (
                  item,
                ) =>
                  item.nftId ===
                  nft.id
                    ? nextItem
                    : item,
              )
            : [
                ...currentCart.items,
                nextItem,
              ],
      }

      saveCart(
        owner.ownerId,
        nextCart,
      )

      return HttpResponse.json(
        nextCart,
        {
          status: 201,
        },
      )
    },
  ),

  http.patch(
    '/api/cart/items/:nftId',
    async ({
      params,
      request,
    }) => {
      const owner =
        resolveCartOwner()

      if (!owner.ok) {
        return owner.response
      }

      const body: unknown =
        await request.json()

      if (
        !isUpdateCartItemRequest(
          body,
        )
      ) {
        return validationError(
          'A quantidade deve ser um número inteiro maior que zero.',
        )
      }

      const nftId =
        String(
          params.nftId,
        )

      const nft =
        getNftById(
          nftId,
        )

      if (!nft) {
        return notFoundError(
          'NFT não encontrado.',
        )
      }

      const currentCart =
        getCartForOwner(
          owner.ownerId,
        )

      const existingItem =
        currentCart.items.find(
          (
            item,
          ) =>
            item.nftId ===
            nftId,
        )

      if (!existingItem) {
        return notFoundError(
          'O NFT não está no carrinho.',
        )
      }

      if (
        body.quantity >
        nft.availableQuantity
      ) {
        return availabilityConflict(
          nft.id,
          body.quantity,
          nft.availableQuantity,
        )
      }

      const nextItem =
        toCartItem(
          nft,
          body.quantity,
        )

      const nextCart: CartState = {
        ...currentCart,

        items:
          currentCart.items.map(
            (
              item,
            ) =>
              item.nftId ===
              nftId
                ? nextItem
                : item,
          ),
      }

      saveCart(
        owner.ownerId,
        nextCart,
      )

      return HttpResponse.json(
        nextCart,
        {
          status: 200,
        },
      )
    },
  ),

  http.delete(
    '/api/cart/items/:nftId',
    ({
      params,
    }) => {
      const owner =
        resolveCartOwner()

      if (!owner.ok) {
        return owner.response
      }

      const nftId =
        String(
          params.nftId,
        )

      const currentCart =
        getCartForOwner(
          owner.ownerId,
        )

      const nextCart: CartState = {
        ...currentCart,

        items:
          currentCart.items.filter(
            (
              item,
            ) =>
              item.nftId !==
              nftId,
          ),
      }

      saveCart(
        owner.ownerId,
        nextCart,
      )

      return HttpResponse.json(
        nextCart,
        {
          status: 200,
        },
      )
    },
  ),

  http.patch(
    '/api/cart/coupon',
    async ({
      request,
    }) => {
      const owner =
        resolveCartOwner()

      if (!owner.ok) {
        return owner.response
      }

      const body: unknown =
        await request.json()

      if (
        !isUpdateCartCouponRequest(
          body,
        )
      ) {
        return validationError(
          'Informe um código de cupom válido ou null para removê-lo.',
        )
      }

      const currentCart =
        getCartForOwner(
          owner.ownerId,
        )

      const normalizedCouponCode =
        body.couponCode
          ?.trim()
          .toUpperCase() ||
        null

      const nextCart: CartState = {
        ...currentCart,

        couponCode:
          normalizedCouponCode,
      }

      saveCart(
        owner.ownerId,
        nextCart,
      )

      return HttpResponse.json(
        nextCart,
        {
          status: 200,
        },
      )
    },
  ),

  http.delete(
    '/api/cart',
    () => {
      const owner =
        resolveCartOwner()

      if (!owner.ok) {
        return owner.response
      }

      clearStoredCart(
        owner.ownerId,
      )

      const emptyCart: CartState = {
        items: [],
        couponCode: null,
      }

      return HttpResponse.json(
        emptyCart,
        {
          status: 200,
        },
      )
    },
  ),
]
