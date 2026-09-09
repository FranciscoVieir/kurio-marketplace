import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import type { Nft } from '@/features/nft/types/nft'

import {
  loadCart,
  saveCart,
} from '../lib/cart-storage'
import type {
  CartItem,
  CartState,
} from '../types/cart'

const GUEST_OWNER_ID = 'guest'

type AddCartItemInput = {
  nft: Nft
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  isEmpty: boolean
  addItem: (input: AddCartItemInput) => void
  removeItem: (nftId: string) => void
  updateQuantity: (
    nftId: string,
    quantity: number,
  ) => void
  clearCart: () => void
  getItemQuantity: (nftId: string) => number
  hasItem: (nftId: string) => boolean
}

export const CartContext =
  createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
}: PropsWithChildren) {
  const [cart, setCart] = useState<CartState>(
    () => loadCart(GUEST_OWNER_ID),
  )

  useEffect(() => {
    saveCart(
      GUEST_OWNER_ID,
      cart,
    )
  }, [cart])

  const addItem = useCallback(
    ({
      nft,
      quantity,
    }: AddCartItemInput) => {
      if (quantity <= 0) {
        return
      }

      setCart((currentCart) => {
        const existingItem = currentCart.items.find(
          (item) => item.nftId === nft.id,
        )

        if (existingItem) {
          const nextQuantity = Math.min(
            existingItem.quantity + quantity,
            nft.availableQuantity,
          )

          return {
            items: currentCart.items.map((item) =>
              item.nftId === nft.id
                ? {
                    ...item,
                    quantity: nextQuantity,
                    priceEth: nft.priceEth,
                    availableQuantity:
                      nft.availableQuantity,
                    version: nft.version,
                  }
                : item,
            ),
          }
        }

        const normalizedQuantity = Math.min(
          quantity,
          nft.availableQuantity,
        )

        const newItem: CartItem = {
          nftId: nft.id,
          name: nft.name,
          imageUrl: nft.imageUrl,
          collection: nft.collection,
          network: nft.network,
          priceEth: nft.priceEth,
          quantity: normalizedQuantity,
          availableQuantity:
            nft.availableQuantity,
          version: nft.version,
        }

        return {
          items: [
            ...currentCart.items,
            newItem,
          ],
        }
      })
    },
    [],
  )

  const removeItem = useCallback(
    (nftId: string) => {
      setCart((currentCart) => ({
        items: currentCart.items.filter(
          (item) => item.nftId !== nftId,
        ),
      }))
    },
    [],
  )

  const updateQuantity = useCallback(
    (
      nftId: string,
      quantity: number,
    ) => {
      setCart((currentCart) => ({
        items: currentCart.items.map((item) => {
          if (item.nftId !== nftId) {
            return item
          }

          const normalizedQuantity = Math.max(
            1,
            Math.min(
              quantity,
              item.availableQuantity,
            ),
          )

          return {
            ...item,
            quantity: normalizedQuantity,
          }
        }),
      }))
    },
    [],
  )

  const clearCart = useCallback(() => {
    setCart({
      items: [],
    })
  }, [])

  const getItemQuantity = useCallback(
    (nftId: string) => {
      return (
        cart.items.find(
          (item) => item.nftId === nftId,
        )?.quantity ?? 0
      )
    },
    [cart.items],
  )

  const hasItem = useCallback(
    (nftId: string) => {
      return cart.items.some(
        (item) => item.nftId === nftId,
      )
    },
    [cart.items],
  )

  const totalItems = useMemo(
    () =>
      cart.items.reduce(
        (
          total,
          item,
        ) => total + item.quantity,
        0,
      ),
    [cart.items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items: cart.items,
      totalItems,
      isEmpty: cart.items.length === 0,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      hasItem,
    }),
    [
      cart.items,
      totalItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      hasItem,
    ],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}