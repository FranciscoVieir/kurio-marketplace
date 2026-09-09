import type { PropsWithChildren } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { router } from '@/app/router/router'
import { CartProvider } from '@/features/cart/context/cart-context'
import { FavoritesProvider } from '@/features/favorites/context/favorites-context'

import { QueryProvider } from './query-provider'

export function AppProviders(_: PropsWithChildren) {
  return (
    <QueryProvider>
      <FavoritesProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </FavoritesProvider>
    </QueryProvider>
  )
}