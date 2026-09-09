import type { PropsWithChildren } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from './query-provider'
import { router } from '@/app/router/router'

export function AppProviders(_: PropsWithChildren) {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}