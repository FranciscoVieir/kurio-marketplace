import type { PropsWithChildren } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { router } from '@/app/router/router'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { CartProvider } from '@/features/cart/context/cart-context'
import { FavoritesProvider } from '@/features/favorites/context/favorites-context'

import { QueryProvider } from './query-provider'

export function AppProviders(_: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryProvider>
  )
}