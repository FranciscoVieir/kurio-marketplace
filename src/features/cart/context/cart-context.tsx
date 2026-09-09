import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import { useAuth } from '@/features/auth/hooks/use-auth'
import type { Nft } from '@/features/nft/types/nft'

import {
  loadCart,
  mergeCarts,
  saveCart,
} from '../lib/cart-storage'

import type {
  CartItem,
  CartState,
} from '../types/cart'

const GUEST_OWNER_ID =
  'guest'

type AddCartItemInput = {
  nft: Nft
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  isEmpty: boolean

  addItem: (
    input: AddCartItemInput,
  ) => void

  removeItem: (
    nftId: string,
  ) => void

  updateQuantity: (
    nftId: string,
    quantity: number,
  ) => void

  clearCart: () => void

  getItemQuantity: (
    nftId: string,
  ) => number

  hasItem: (
    nftId: string,
  ) => boolean
}

export const CartContext =
  createContext<CartContextValue | null>(
    null,
  )

export function CartProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth()

  const ownerId =
    isAuthenticated && user
      ? user.id
      : GUEST_OWNER_ID

  const [
    cart,
    setCart,
  ] =
    useState<CartState>({
      items: [],
    })

  const activeOwnerRef =
    useRef<string | null>(
      null,
    )

  const hasInitializedRef =
    useRef(false)

  /*
   * Impede que o efeito de
   * persistência grave o estado
   * do owner anterior no novo
   * owner durante login/logout.
   */
  const skipPersistenceRef =
    useRef(false)

  useEffect(() => {
    if (isInitializing) {
      return
    }

    const previousOwnerId =
      activeOwnerRef.current

    /*
     * Primeira resolução da
     * autenticação.
     */
    if (
      !hasInitializedRef.current
    ) {
      const nextCart =
        isAuthenticated &&
        user
          ? mergeCarts(
              GUEST_OWNER_ID,
              user.id,
            )
          : loadCart(
              GUEST_OWNER_ID,
            )

      skipPersistenceRef.current =
        true

      activeOwnerRef.current =
        ownerId

      hasInitializedRef.current =
        true

      setCart(
        nextCart,
      )

      return
    }

    if (
      previousOwnerId ===
      ownerId
    ) {
      return
    }

    /*
     * guest → usuário
     *
     * Login ou cadastro.
     */
    if (
      previousOwnerId ===
        GUEST_OWNER_ID &&
      isAuthenticated &&
      user
    ) {
      /*
       * O estado React pode ter
       * alterações ainda mais
       * recentes que o storage.
       */
      saveCart(
        GUEST_OWNER_ID,
        cart,
      )

      const mergedCart =
        mergeCarts(
          GUEST_OWNER_ID,
          user.id,
        )

      skipPersistenceRef.current =
        true

      activeOwnerRef.current =
        user.id

      setCart(
        mergedCart,
      )

      return
    }

    /*
     * usuário → guest
     *
     * Logout ou expiração.
     *
     * Não transferimos o
     * carrinho privado da conta
     * para o guest.
     */
    skipPersistenceRef.current =
      true

    activeOwnerRef.current =
      ownerId

    setCart(
      loadCart(
        ownerId,
      ),
    )
  }, [
    cart,
    isAuthenticated,
    isInitializing,
    ownerId,
    user,
  ])

  useEffect(() => {
    if (
      isInitializing ||
      !hasInitializedRef.current ||
      activeOwnerRef.current !==
        ownerId
    ) {
      return
    }

    if (
      skipPersistenceRef.current
    ) {
      skipPersistenceRef.current =
        false

      return
    }

    saveCart(
      ownerId,
      cart,
    )
  }, [
    cart,
    isInitializing,
    ownerId,
  ])

  const addItem =
    useCallback(
      ({
        nft,
        quantity,
      }: AddCartItemInput) => {
        if (
          quantity <= 0 ||
          nft.availableQuantity <=
            0
        ) {
          return
        }

        setCart(
          (
            currentCart,
          ) => {
            const existingItem =
              currentCart.items.find(
                (item) =>
                  item.nftId ===
                  nft.id,
              )

            if (
              existingItem
            ) {
              const nextQuantity =
                Math.min(
                  existingItem.quantity +
                    quantity,

                  nft.availableQuantity,
                )

              return {
                items:
                  currentCart.items.map(
                    (
                      item,
                    ) =>
                      item.nftId ===
                      nft.id
                        ? {
                            ...item,

                            quantity:
                              nextQuantity,

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

                            availableQuantity:
                              nft.availableQuantity,

                            version:
                              nft.version,
                          }
                        : item,
                  ),
              }
            }

            const normalizedQuantity =
              Math.min(
                quantity,
                nft.availableQuantity,
              )

            if (
              normalizedQuantity <=
              0
            ) {
              return currentCart
            }

            const newItem: CartItem =
              {
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

                quantity:
                  normalizedQuantity,

                availableQuantity:
                  nft.availableQuantity,

                version:
                  nft.version,
              }

            return {
              items: [
                ...currentCart.items,
                newItem,
              ],
            }
          },
        )
      },
      [],
    )

  const removeItem =
    useCallback(
      (
        nftId: string,
      ) => {
        setCart(
          (
            currentCart,
          ) => ({
            items:
              currentCart.items.filter(
                (
                  item,
                ) =>
                  item.nftId !==
                  nftId,
              ),
          }),
        )
      },
      [],
    )

  const updateQuantity =
    useCallback(
      (
        nftId: string,
        quantity: number,
      ) => {
        setCart(
          (
            currentCart,
          ) => ({
            items:
              currentCart.items.map(
                (
                  item,
                ) => {
                  if (
                    item.nftId !==
                    nftId
                  ) {
                    return item
                  }

                  if (
                    item.availableQuantity <=
                    0
                  ) {
                    return item
                  }

                  const normalizedQuantity =
                    Math.max(
                      1,

                      Math.min(
                        quantity,
                        item.availableQuantity,
                      ),
                    )

                  return {
                    ...item,

                    quantity:
                      normalizedQuantity,
                  }
                },
              ),
          }),
        )
      },
      [],
    )

  const clearCart =
    useCallback(
      () => {
        setCart({
          items: [],
        })
      },
      [],
    )

  const getItemQuantity =
    useCallback(
      (
        nftId: string,
      ) => {
        return (
          cart.items.find(
            (
              item,
            ) =>
              item.nftId ===
              nftId,
          )?.quantity ?? 0
        )
      },
      [
        cart.items,
      ],
    )

  const hasItem =
    useCallback(
      (
        nftId: string,
      ) => {
        return cart.items.some(
          (
            item,
          ) =>
            item.nftId ===
            nftId,
        )
      },
      [
        cart.items,
      ],
    )

  const totalItems =
    useMemo(
      () =>
        cart.items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,

          0,
        ),
      [
        cart.items,
      ],
    )

  const value =
    useMemo<CartContextValue>(
      () => ({
        items:
          cart.items,

        totalItems,

        isEmpty:
          cart.items.length ===
          0,

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
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  )
}