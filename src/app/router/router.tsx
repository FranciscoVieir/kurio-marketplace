import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import { CartPage } from '@/routes/cart'
import { HomePage } from '@/routes/home'
import { NftDetailPage } from '@/routes/nft-detail'

import type {
  CatalogParams,
  CatalogSort,
  CatalogTab,
} from '@/features/catalog/types/catalog'

import type { NftNetwork } from '@/features/nft/types/nft'

function parsePage(value: unknown) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

const allowedTabs: CatalogTab[] = [
  'all',
  'new',
  'trending',
]

const allowedSorts: CatalogSort[] = [
  'featured',
  'price-asc',
  'price-desc',
  'newest',
]

const allowedNetworks: NftNetwork[] = [
  'ethereum',
  'polygon',
  'solana',
]

function validateCatalogSearch(
  search: Record<string, unknown>,
): CatalogParams {
  const sort = allowedSorts.includes(
    search.sort as CatalogSort,
  )
    ? (search.sort as CatalogSort)
    : 'featured'

  const network = allowedNetworks.includes(
    search.network as NftNetwork,
  )
    ? (search.network as NftNetwork)
    : undefined

  const tab = allowedTabs.includes(
    search.tab as CatalogTab,
  )
    ? (search.tab as CatalogTab)
    : 'all'

  return {
    search:
      typeof search.search === 'string' &&
      search.search.trim()
        ? search.search
        : undefined,

    category:
      typeof search.category === 'string' &&
      search.category.trim()
        ? search.category
        : undefined,

    network,

    minPrice:
      typeof search.minPrice === 'string'
        ? search.minPrice
        : undefined,

    maxPrice:
      typeof search.maxPrice === 'string'
        ? search.maxPrice
        : undefined,

    sort,

    tab,

    page: parsePage(search.page),
  }
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: validateCatalogSearch,
  component: HomePage,
})

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: NftDetailPage,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftDetailRoute,
  cartRoute,
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}