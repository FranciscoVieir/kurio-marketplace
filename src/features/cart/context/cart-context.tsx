import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  useAuth,
} from '@/features/auth/hooks/use-auth'
import type {
  Nft,
} from '@/features/nft/types/nft'

import {
  addCartItem,
  clearCartRequest,
  getCart,
  removeCartItem,
  updateCartCoupon,
  updateCartItem,
} from '../api/cart-api'
import {
  cartQueryKeys,
} from '../api/cart-query-keys'

import type {
  CartItem,
  CartState,
} from '../types/cart'

const GUEST_OWNER_ID =
  'guest'

const PROCESSED_ORDERS_STORAGE_PREFIX =
  'kurio:cart:processed-orders:'

const EMPTY_CART: CartState = {
  items: [],
  couponCode: null,
}

const CART_ERROR_MESSAGE =
  'Não foi possível atualizar o carrinho. Tente novamente.'

type PurchasedCartItemInput = {
  nftId: string
  quantity: number
}

type AddCartItemInput = {
  nft: Nft
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  couponCode: string | null
  totalItems: number
  isEmpty: boolean
  isHydrating: boolean

  addItem: (
    input: AddCartItemInput,
  ) => Promise<boolean>

  removeItem: (
    nftId: string,
  ) => void

  updateQuantity: (
    nftId: string,
    quantity: number,
  ) => void

  syncNft: (
    nft: Nft,
  ) => void

  applyCoupon: (
    couponCode: string,
  ) => void

  removeCoupon: () => void

  clearCart: () => void

  consumeConfirmedOrder: (
    orderId: string,
    items: PurchasedCartItemInput[],
  ) => void

  getItemQuantity: (
    nftId: string,
  ) => number

  hasItem: (
    nftId: string,
  ) => boolean
}

type OwnerMutationVariables = {
  ownerId: string
}

type AddMutationVariables =
  OwnerMutationVariables & {
    nft: Nft
    quantity: number
  }

type UpdateMutationVariables =
  OwnerMutationVariables & {
    nftId: string
    quantity: number
  }

type RemoveMutationVariables =
  OwnerMutationVariables & {
    nftId: string
  }

type CouponMutationVariables =
  OwnerMutationVariables & {
    couponCode: string | null
  }

type CartMutationContext = {
  previousCart:
    | CartState
    | undefined
}

type ConsumeOperation =
  | {
      type: 'update'
      nftId: string
      quantity: number
    }
  | {
      type: 'remove'
      nftId: string
    }

type ConsumeMutationVariables =
  OwnerMutationVariables & {
    orderId: string
    operations: ConsumeOperation[]
    optimisticCart: CartState
  }

function getProcessedOrdersStorageKey(
  ownerId: string,
) {
  return `${PROCESSED_ORDERS_STORAGE_PREFIX}${ownerId}`
}

function loadProcessedOrderIds(
  ownerId: string,
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return new Set<string>()
  }

  try {
    const rawValue =
      window.localStorage.getItem(
        getProcessedOrdersStorageKey(
          ownerId,
        ),
      )

    if (!rawValue) {
      return new Set<string>()
    }

    const parsedValue: unknown =
      JSON.parse(
        rawValue,
      )

    if (
      !Array.isArray(
        parsedValue,
      )
    ) {
      return new Set<string>()
    }

    return new Set(
      parsedValue.filter(
        (
          value,
        ): value is string =>
          typeof value ===
          'string',
      ),
    )
  } catch {
    return new Set<string>()
  }
}

function saveProcessedOrderIds(
  ownerId: string,
  orderIds: Set<string>,
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  try {
    window.localStorage.setItem(
      getProcessedOrdersStorageKey(
        ownerId,
      ),
      JSON.stringify(
        Array.from(
          orderIds,
        ),
      ),
    )
  } catch {
    /*
     * A confirmação da compra não
     * depende do storage estar
     * disponível. O registro serve
     * apenas como proteção adicional
     * contra reaplicação após refresh.
     */
  }
}

function optimisticAddItem(
  currentCart: CartState,
  nft: Nft,
  quantity: number,
): CartState {
  if (
    quantity <= 0 ||
    nft.availableQuantity <=
      0
  ) {
    return currentCart
  }

  const existingItem =
    currentCart.items.find(
      (
        item,
      ) =>
        item.nftId ===
        nft.id,
    )

  const nextQuantity =
    Math.min(
      (
        existingItem?.quantity ??
        0
      ) +
        quantity,

      nft.availableQuantity,
    )

  const nextItem: CartItem = {
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
      nextQuantity,

    availableQuantity:
      nft.availableQuantity,

    version:
      nft.version,
  }

  return {
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
}

function optimisticUpdateQuantity(
  currentCart: CartState,
  nftId: string,
  quantity: number,
): CartState {
  return {
    ...currentCart,

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

          return {
            ...item,

            quantity:
              Math.max(
                1,
                Math.min(
                  quantity,
                  item.availableQuantity,
                ),
              ),
          }
        },
      ),
  }
}

function optimisticRemoveItem(
  currentCart: CartState,
  nftId: string,
): CartState {
  return {
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
}

function optimisticCoupon(
  currentCart: CartState,
  couponCode:
    | string
    | null,
): CartState {
  return {
    ...currentCart,

    couponCode:
      couponCode
        ?.trim()
        .toUpperCase() ||
      null,
  }
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

  const queryClient =
    useQueryClient()

  const [
    cartError,
    setCartError,
  ] =
    useState<string | null>(
      null,
    )

  const processingOrderIdsRef =
    useRef(
      new Set<string>(),
    )

  const previousOwnerRef =
    useRef<string | null>(
      null,
    )

  const ownerId =
    isAuthenticated &&
    user
      ? user.id
      : GUEST_OWNER_ID

  const ownerQueryKey =
    cartQueryKeys.owner(
      ownerId,
    )

  const cartQuery =
    useQuery({
      queryKey:
        ownerQueryKey,

      queryFn:
        getCart,

      enabled:
        !isInitializing,

      staleTime: 0,
    })

  /*
   * O cache do carrinho é isolado por
   * owner. Ao sair de uma conta,
   * descartamos o snapshot privado
   * daquele usuário desta instância
   * do QueryClient.
   */
  useEffect(() => {
    const previousOwnerId =
      previousOwnerRef.current

    previousOwnerRef.current =
      ownerId

    if (
      !previousOwnerId ||
      previousOwnerId ===
        ownerId ||
      previousOwnerId ===
        GUEST_OWNER_ID
    ) {
      return
    }

    queryClient.removeQueries({
      queryKey:
        cartQueryKeys.owner(
          previousOwnerId,
        ),

      exact: true,
    })
  }, [
    ownerId,
    queryClient,
  ])

  const addMutation =
    useMutation({
      mutationFn:
        async (
          variables:
            AddMutationVariables,
        ) =>
          addCartItem({
            nftId:
              variables.nft.id,

            quantity:
              variables.quantity,
          }),

      onMutate:
        async (
          variables,
        ): Promise<CartMutationContext> => {
          setCartError(
            null,
          )

          const queryKey =
            cartQueryKeys.owner(
              variables.ownerId,
            )

          await queryClient.cancelQueries({
            queryKey,
          })

          const previousCart =
            queryClient.getQueryData<CartState>(
              queryKey,
            )

          queryClient.setQueryData<CartState>(
            queryKey,
            optimisticAddItem(
              previousCart ??
                EMPTY_CART,
              variables.nft,
              variables.quantity,
            ),
          )

          return {
            previousCart,
          }
        },

      onError:
        (
          _error,
          variables,
          context,
        ) => {
          if (
            context?.previousCart
          ) {
            queryClient.setQueryData(
              cartQueryKeys.owner(
                variables.ownerId,
              ),
              context.previousCart,
            )
          }

          setCartError(
            CART_ERROR_MESSAGE,
          )
        },

      onSuccess:
        (
          nextCart,
          variables,
        ) => {
          queryClient.setQueryData(
            cartQueryKeys.owner(
              variables.ownerId,
            ),
            nextCart,
          )
        },

      onSettled:
        (
          _data,
          _error,
          variables,
        ) => {
          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },
    })

  const updateMutation =
    useMutation({
      mutationFn:
        async (
          variables:
            UpdateMutationVariables,
        ) =>
          updateCartItem(
            variables.nftId,
            {
              quantity:
                variables.quantity,
            },
          ),

      onMutate:
        async (
          variables,
        ): Promise<CartMutationContext> => {
          setCartError(
            null,
          )

          const queryKey =
            cartQueryKeys.owner(
              variables.ownerId,
            )

          await queryClient.cancelQueries({
            queryKey,
          })

          const previousCart =
            queryClient.getQueryData<CartState>(
              queryKey,
            )

          queryClient.setQueryData<CartState>(
            queryKey,
            optimisticUpdateQuantity(
              previousCart ??
                EMPTY_CART,
              variables.nftId,
              variables.quantity,
            ),
          )

          return {
            previousCart,
          }
        },

      onError:
        (
          _error,
          variables,
          context,
        ) => {
          if (
            context?.previousCart
          ) {
            queryClient.setQueryData(
              cartQueryKeys.owner(
                variables.ownerId,
              ),
              context.previousCart,
            )
          }

          setCartError(
            CART_ERROR_MESSAGE,
          )
        },

      onSuccess:
        (
          nextCart,
          variables,
        ) => {
          queryClient.setQueryData(
            cartQueryKeys.owner(
              variables.ownerId,
            ),
            nextCart,
          )
        },

      onSettled:
        (
          _data,
          _error,
          variables,
        ) => {
          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },
    })

  const removeMutation =
    useMutation({
      mutationFn:
        async (
          variables:
            RemoveMutationVariables,
        ) =>
          removeCartItem(
            variables.nftId,
          ),

      onMutate:
        async (
          variables,
        ): Promise<CartMutationContext> => {
          setCartError(
            null,
          )

          const queryKey =
            cartQueryKeys.owner(
              variables.ownerId,
            )

          await queryClient.cancelQueries({
            queryKey,
          })

          const previousCart =
            queryClient.getQueryData<CartState>(
              queryKey,
            )

          queryClient.setQueryData<CartState>(
            queryKey,
            optimisticRemoveItem(
              previousCart ??
                EMPTY_CART,
              variables.nftId,
            ),
          )

          return {
            previousCart,
          }
        },

      onError:
        (
          _error,
          variables,
          context,
        ) => {
          if (
            context?.previousCart
          ) {
            queryClient.setQueryData(
              cartQueryKeys.owner(
                variables.ownerId,
              ),
              context.previousCart,
            )
          }

          setCartError(
            CART_ERROR_MESSAGE,
          )
        },

      onSuccess:
        (
          nextCart,
          variables,
        ) => {
          queryClient.setQueryData(
            cartQueryKeys.owner(
              variables.ownerId,
            ),
            nextCart,
          )
        },

      onSettled:
        (
          _data,
          _error,
          variables,
        ) => {
          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },
    })

  const couponMutation =
    useMutation({
      mutationFn:
        async (
          variables:
            CouponMutationVariables,
        ) =>
          updateCartCoupon({
            couponCode:
              variables.couponCode,
          }),

      onMutate:
        async (
          variables,
        ): Promise<CartMutationContext> => {
          setCartError(
            null,
          )

          const queryKey =
            cartQueryKeys.owner(
              variables.ownerId,
            )

          await queryClient.cancelQueries({
            queryKey,
          })

          const previousCart =
            queryClient.getQueryData<CartState>(
              queryKey,
            )

          queryClient.setQueryData<CartState>(
            queryKey,
            optimisticCoupon(
              previousCart ??
                EMPTY_CART,
              variables.couponCode,
            ),
          )

          return {
            previousCart,
          }
        },

      onError:
        (
          _error,
          variables,
          context,
        ) => {
          if (
            context?.previousCart
          ) {
            queryClient.setQueryData(
              cartQueryKeys.owner(
                variables.ownerId,
              ),
              context.previousCart,
            )
          }

          setCartError(
            CART_ERROR_MESSAGE,
          )
        },

      onSuccess:
        (
          nextCart,
          variables,
        ) => {
          queryClient.setQueryData(
            cartQueryKeys.owner(
              variables.ownerId,
            ),
            nextCart,
          )
        },

      onSettled:
        (
          _data,
          _error,
          variables,
        ) => {
          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },
    })

  const clearMutation =
    useMutation({
      mutationFn:
        async (
          _variables:
            OwnerMutationVariables,
        ) =>
          clearCartRequest(),

      onMutate:
        async (
          variables,
        ): Promise<CartMutationContext> => {
          setCartError(
            null,
          )

          const queryKey =
            cartQueryKeys.owner(
              variables.ownerId,
            )

          await queryClient.cancelQueries({
            queryKey,
          })

          const previousCart =
            queryClient.getQueryData<CartState>(
              queryKey,
            )

          queryClient.setQueryData<CartState>(
            queryKey,
            EMPTY_CART,
          )

          return {
            previousCart,
          }
        },

      onError:
        (
          _error,
          variables,
          context,
        ) => {
          if (
            context?.previousCart
          ) {
            queryClient.setQueryData(
              cartQueryKeys.owner(
                variables.ownerId,
              ),
              context.previousCart,
            )
          }

          setCartError(
            CART_ERROR_MESSAGE,
          )
        },

      onSuccess:
        (
          nextCart,
          variables,
        ) => {
          queryClient.setQueryData(
            cartQueryKeys.owner(
              variables.ownerId,
            ),
            nextCart,
          )
        },

      onSettled:
        (
          _data,
          _error,
          variables,
        ) => {
          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },
    })

  const consumeMutation =
    useMutation({
      mutationFn:
        async (
          variables:
            ConsumeMutationVariables,
        ) => {
          let nextCart =
            variables.optimisticCart

          for (
            const operation of
            variables.operations
          ) {
            nextCart =
              operation.type ===
              'remove'
                ? await removeCartItem(
                    operation.nftId,
                  )
                : await updateCartItem(
                    operation.nftId,
                    {
                      quantity:
                        operation.quantity,
                    },
                  )
          }

          return nextCart
        },

      onError:
        (
          _error,
          variables,
        ) => {
          processingOrderIdsRef.current.delete(
            variables.orderId,
          )

          setCartError(
            CART_ERROR_MESSAGE,
          )

          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },

      onSuccess:
        (
          nextCart,
          variables,
        ) => {
          const processedOrderIds =
            loadProcessedOrderIds(
              variables.ownerId,
            )

          processedOrderIds.add(
            variables.orderId,
          )

          saveProcessedOrderIds(
            variables.ownerId,
            processedOrderIds,
          )

          processingOrderIdsRef.current.delete(
            variables.orderId,
          )

          queryClient.setQueryData(
            cartQueryKeys.owner(
              variables.ownerId,
            ),
            nextCart,
          )
        },

      onSettled:
        (
          _data,
          _error,
          variables,
        ) => {
          void queryClient.invalidateQueries({
            queryKey:
              cartQueryKeys.owner(
                variables.ownerId,
              ),
          })
        },
    })

  const cart =
    cartQuery.data ??
    EMPTY_CART

  const isHydrating =
    isInitializing ||
    cartQuery.isPending

  const addItem =
    useCallback(
      async ({
        nft,
        quantity,
      }: AddCartItemInput) => {
        if (
          quantity <= 0 ||
          nft.availableQuantity <=
            0
        ) {
          return false
        }

        try {
          await addMutation.mutateAsync({
            ownerId,
            nft,
            quantity,
          })

          return true
        } catch {
          return false
        }
      },
      [
        addMutation,
        ownerId,
      ],
    )

  const removeItem =
    useCallback(
      (
        nftId: string,
      ) => {
        removeMutation.mutate({
          ownerId,
          nftId,
        })
      },
      [
        ownerId,
        removeMutation,
      ],
    )

  const updateQuantity =
    useCallback(
      (
        nftId: string,
        quantity: number,
      ) => {
        const item =
          cart.items.find(
            (
              currentItem,
            ) =>
              currentItem.nftId ===
              nftId,
          )

        if (
          !item ||
          item.availableQuantity <=
            0
        ) {
          return
        }

        const normalizedQuantity =
          Math.max(
            1,
            Math.min(
              quantity,
              item.availableQuantity,
            ),
          )

        updateMutation.mutate({
          ownerId,
          nftId,
          quantity:
            normalizedQuantity,
        })
      },
      [
        cart.items,
        ownerId,
        updateMutation,
      ],
    )

  /*
   * O evento realtime atualiza o cache
   * remoto imediatamente. Em reconnect,
   * o RealtimeProvider invalida também
   * a query do carrinho para reconciliar
   * novamente pela API REST.
   */
  const syncNft =
    useCallback(
      (
        nft: Nft,
      ) => {
        queryClient.setQueryData<CartState>(
          cartQueryKeys.owner(
            ownerId,
          ),
          (
            currentCart,
          ) => {
            if (!currentCart) {
              return currentCart
            }

            let hasChanges =
              false

            const items =
              currentCart.items.map(
                (
                  item,
                ) => {
                  if (
                    item.nftId !==
                    nft.id
                  ) {
                    return item
                  }

                  if (
                    nft.version <=
                    item.version
                  ) {
                    return item
                  }

                  hasChanges =
                    true

                  return {
                    ...item,

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
                },
              )

            if (!hasChanges) {
              return currentCart
            }

            return {
              ...currentCart,
              items,
            }
          },
        )
      },
      [
        ownerId,
        queryClient,
      ],
    )

  const applyCoupon =
    useCallback(
      (
        couponCode: string,
      ) => {
        const normalizedCouponCode =
          couponCode
            .trim()
            .toUpperCase()

        if (
          !normalizedCouponCode
        ) {
          return
        }

        couponMutation.mutate({
          ownerId,

          couponCode:
            normalizedCouponCode,
        })
      },
      [
        couponMutation,
        ownerId,
      ],
    )

  const removeCoupon =
    useCallback(
      () => {
        couponMutation.mutate({
          ownerId,
          couponCode: null,
        })
      },
      [
        couponMutation,
        ownerId,
      ],
    )

  const clearCart =
    useCallback(
      () => {
        clearMutation.mutate({
          ownerId,
        })
      },
      [
        clearMutation,
        ownerId,
      ],
    )

  const consumeConfirmedOrder =
    useCallback(
      (
        orderId: string,
        purchasedItems:
          PurchasedCartItemInput[],
      ) => {
        const normalizedOrderId =
          orderId.trim()

        if (
          !normalizedOrderId ||
          purchasedItems.length ===
            0 ||
          isHydrating
        ) {
          return
        }

        const processedOrderIds =
          loadProcessedOrderIds(
            ownerId,
          )

        if (
          processedOrderIds.has(
            normalizedOrderId,
          ) ||
          processingOrderIdsRef.current.has(
            normalizedOrderId,
          )
        ) {
          return
        }

        const purchasedQuantities =
          new Map<string, number>()

        for (
          const purchasedItem of
          purchasedItems
        ) {
          if (
            !Number.isInteger(
              purchasedItem.quantity,
            ) ||
            purchasedItem.quantity <=
              0
          ) {
            continue
          }

          purchasedQuantities.set(
            purchasedItem.nftId,
            (
              purchasedQuantities.get(
                purchasedItem.nftId,
              ) ??
              0
            ) +
              purchasedItem.quantity,
          )
        }

        if (
          purchasedQuantities.size ===
          0
        ) {
          return
        }

        const currentCart =
          queryClient.getQueryData<CartState>(
            cartQueryKeys.owner(
              ownerId,
            ),
          ) ??
          cart

        const operations:
          ConsumeOperation[] =
          []

        let optimisticCart =
          currentCart

        for (
          const [
            nftId,
            purchasedQuantity,
          ] of
          purchasedQuantities
        ) {
          const item =
            optimisticCart.items.find(
              (
                currentItem,
              ) =>
                currentItem.nftId ===
                nftId,
            )

          if (!item) {
            continue
          }

          const remainingQuantity =
            item.quantity -
            purchasedQuantity

          if (
            remainingQuantity <=
            0
          ) {
            operations.push({
              type:
                'remove',

              nftId,
            })

            optimisticCart =
              optimisticRemoveItem(
                optimisticCart,
                nftId,
              )

            continue
          }

          operations.push({
            type:
              'update',

            nftId,

            quantity:
              remainingQuantity,
          })

          optimisticCart =
            optimisticUpdateQuantity(
              optimisticCart,
              nftId,
              remainingQuantity,
            )
        }

        /*
         * Se os itens já não estão mais
         * no carrinho, consideramos o
         * efeito aplicado e apenas
         * registramos o orderId.
         */
        if (
          operations.length ===
          0
        ) {
          processedOrderIds.add(
            normalizedOrderId,
          )

          saveProcessedOrderIds(
            ownerId,
            processedOrderIds,
          )

          return
        }

        processingOrderIdsRef.current.add(
          normalizedOrderId,
        )

        const queryKey =
          cartQueryKeys.owner(
            ownerId,
          )

        const previousCart =
          currentCart

        queryClient.setQueryData(
          queryKey,
          optimisticCart,
        )

        consumeMutation.mutate(
          {
            ownerId,

            orderId:
              normalizedOrderId,

            operations,

            optimisticCart,
          },
          {
            onError:
              () => {
                queryClient.setQueryData(
                  queryKey,
                  previousCart,
                )
              },
          },
        )
      },
      [
        cart,
        consumeMutation,
        isHydrating,
        ownerId,
        queryClient,
      ],
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
          )?.quantity ??
          0
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

        couponCode:
          cart.couponCode,

        totalItems,

        isEmpty:
          cart.items.length ===
          0,

        isHydrating,

        addItem,

        removeItem,

        updateQuantity,

        syncNft,

        applyCoupon,

        removeCoupon,

        clearCart,

        consumeConfirmedOrder,

        getItemQuantity,

        hasItem,
      }),
      [
        cart.items,
        cart.couponCode,
        totalItems,
        isHydrating,
        addItem,
        removeItem,
        updateQuantity,
        syncNft,
        applyCoupon,
        removeCoupon,
        clearCart,
        consumeConfirmedOrder,
        getItemQuantity,
        hasItem,
      ],
    )

  const visibleError =
    cartError ??
    (
      cartQuery.isError
        ? 'Não foi possível carregar o carrinho.'
        : null
    )

  return (
    <CartContext.Provider
      value={value}
    >
      {children}

      {visibleError && (
        <p
          role="alert"
          className="sr-only"
        >
          {visibleError}
        </p>
      )}
    </CartContext.Provider>
  )
}
