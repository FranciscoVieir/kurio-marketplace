import type { NftNetwork } from '@/features/nft/types/nft'

import type {
  CartItem,
  CartState,
} from '../types/cart'

const CART_STORAGE_PREFIX =
  'kurio:cart'

const allowedNetworks: NftNetwork[] = [
  'ethereum',
  'polygon',
  'solana',
]

function getStorageKey(
  ownerId: string,
) {
  return `${CART_STORAGE_PREFIX}:${ownerId}`
}

function isCartItem(
  value: unknown,
): value is CartItem {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const item =
    value as Record<
      string,
      unknown
    >

  return (
    typeof item.nftId ===
      'string' &&
    typeof item.name ===
      'string' &&
    typeof item.imageUrl ===
      'string' &&
    typeof item.collection ===
      'string' &&
    typeof item.network ===
      'string' &&
    allowedNetworks.includes(
      item.network as NftNetwork,
    ) &&
    typeof item.priceEth ===
      'string' &&
    typeof item.quantity ===
      'number' &&
    Number.isInteger(
      item.quantity,
    ) &&
    item.quantity > 0 &&
    typeof item.availableQuantity ===
      'number' &&
    Number.isInteger(
      item.availableQuantity,
    ) &&
    item.availableQuantity >=
      0 &&
    typeof item.version ===
      'number' &&
    Number.isInteger(
      item.version,
    ) &&
    item.version >= 0
  )
}

function isCartState(
  value: unknown,
): value is CartState {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const state =
    value as Record<
      string,
      unknown
    >

  return (
    Array.isArray(
      state.items,
    ) &&
    state.items.every(
      isCartItem,
    )
  )
}

function normalizeCart(
  cart: CartState,
): CartState {
  const normalizedItems =
    cart.items
      .filter(
        (item) =>
          item.availableQuantity >
            0 &&
          item.quantity > 0,
      )
      .map((item) => ({
        ...item,

        quantity: Math.min(
          item.quantity,
          item.availableQuantity,
        ),
      }))

  return {
    items:
      normalizedItems,
  }
}

export function loadCart(
  ownerId: string,
): CartState {
  if (
    typeof window ===
    'undefined'
  ) {
    return {
      items: [],
    }
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        getStorageKey(
          ownerId,
        ),
      )

    if (!storedValue) {
      return {
        items: [],
      }
    }

    const parsedValue: unknown =
      JSON.parse(
        storedValue,
      )

    if (
      !isCartState(
        parsedValue,
      )
    ) {
      return {
        items: [],
      }
    }

    return normalizeCart(
      parsedValue,
    )
  } catch {
    return {
      items: [],
    }
  }
}

export function saveCart(
  ownerId: string,
  cart: CartState,
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  const normalizedCart =
    normalizeCart(
      cart,
    )

  window.localStorage.setItem(
    getStorageKey(
      ownerId,
    ),
    JSON.stringify(
      normalizedCart,
    ),
  )
}

export function clearStoredCart(
  ownerId: string,
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    getStorageKey(
      ownerId,
    ),
  )
}

export function mergeCarts(
  sourceOwnerId: string,
  targetOwnerId: string,
): CartState {
  if (
    sourceOwnerId ===
    targetOwnerId
  ) {
    return loadCart(
      targetOwnerId,
    )
  }

  const sourceCart =
    loadCart(
      sourceOwnerId,
    )

  const targetCart =
    loadCart(
      targetOwnerId,
    )

  const mergedItems =
    new Map<
      string,
      CartItem
    >()

  for (
    const item of
    targetCart.items
  ) {
    mergedItems.set(
      item.nftId,
      {
        ...item,
      },
    )
  }

  for (
    const sourceItem of
    sourceCart.items
  ) {
    const targetItem =
      mergedItems.get(
        sourceItem.nftId,
      )

    if (!targetItem) {
      if (
        sourceItem.availableQuantity >
        0
      ) {
        mergedItems.set(
          sourceItem.nftId,
          {
            ...sourceItem,

            quantity:
              Math.min(
                sourceItem.quantity,
                sourceItem.availableQuantity,
              ),
          },
        )
      }

      continue
    }

    /*
     * Mantemos o snapshot de
     * maior versão como a
     * informação mais recente
     * conhecida pelo cliente.
     */
    const freshestItem =
      sourceItem.version >=
      targetItem.version
        ? sourceItem
        : targetItem

    if (
      freshestItem.availableQuantity <=
      0
    ) {
      mergedItems.delete(
        sourceItem.nftId,
      )

      continue
    }

    const mergedQuantity =
      Math.min(
        sourceItem.quantity +
          targetItem.quantity,

        freshestItem.availableQuantity,
      )

    mergedItems.set(
      sourceItem.nftId,
      {
        ...freshestItem,

        quantity:
          mergedQuantity,
      },
    )
  }

  const mergedCart =
    normalizeCart({
      items:
        Array.from(
          mergedItems.values(),
        ),
    })

  saveCart(
    targetOwnerId,
    mergedCart,
  )

  clearStoredCart(
    sourceOwnerId,
  )

  return mergedCart
}