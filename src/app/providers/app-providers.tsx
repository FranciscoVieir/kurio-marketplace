import {
  RouterProvider,
} from '@tanstack/react-router'

import {
  router,
} from '@/app/router/router'

import {
  AuthProvider,
} from '@/features/auth/context/auth-context'

import {
  CartProvider,
} from '@/features/cart/context/cart-context'

import {
  FavoritesProvider,
} from '@/features/favorites/context/favorites-context'

import {
  QueryProvider,
} from './query-provider'

import {
  RealtimeProvider,
} from './realtime-provider'

export function AppProviders() {
  return (
    <QueryProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <RealtimeProvider>
              <RouterProvider
                router={router}
              />
            </RealtimeProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryProvider>
  )
}