import type {
  CartItem,
  CartState,
} from '../types/cart'

const CART_STORAGE_PREFIX = 'kurio:cart'

function getStorageKey(ownerId: string) {
  return `${CART_STORAGE_PREFIX}:${ownerId}`
}

function isCartItem(value: unknown): value is CartItem {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false
  }

  const item = value as Record<string, unknown>

  return (
    typeof item.nftId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.imageUrl === 'string' &&
    typeof item.collection === 'string' &&
    typeof item.network === 'string' &&
    typeof item.priceEth === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.availableQuantity === 'number' &&
    Number.isInteger(item.availableQuantity) &&
    item.availableQuantity >= 0 &&
    typeof item.version === 'number'
  )
}

function isCartState(
  value: unknown,
): value is CartState {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false
  }

  const state = value as Record<string, unknown>

  return (
    Array.isArray(state.items) &&
    state.items.every(isCartItem)
  )
}

export function loadCart(
  ownerId: string,
): CartState {
  if (typeof window === 'undefined') {
    return {
      items: [],
    }
  }

  try {
    const storedValue = window.localStorage.getItem(
      getStorageKey(ownerId),
    )

    if (!storedValue) {
      return {
        items: [],
      }
    }

    const parsedValue: unknown = JSON.parse(
      storedValue,
    )

    if (!isCartState(parsedValue)) {
      return {
        items: [],
      }
    }

    return parsedValue
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
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    getStorageKey(ownerId),
    JSON.stringify(cart),
  )
}

export function clearStoredCart(
  ownerId: string,
) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(
    getStorageKey(ownerId),
  )
}