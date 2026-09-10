import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import { ProtectedRoute } from '@/features/auth/components/protected-route'

import { ProfileWalletsPage } from '@/routes/profile-wallets'

import {
  ProfileFavoritesPage,
} from '@/routes/profile-favorites'

import {
  ProfileActivityPage,
} from '@/routes/profile-activity'

import {
  ProfileLayout,
} from '@/features/profile/components/profile-layout'

import type {
  CatalogParams,
  CatalogSort,
  CatalogTab,
} from '@/features/catalog/types/catalog'

import type {
  NftNetwork,
} from '@/features/nft/types/nft'

import { CartPage } from '@/routes/cart'
import { CheckoutPage } from '@/routes/checkout'
import { HomePage } from '@/routes/home'
import { NftDetailPage } from '@/routes/nft-detail'
import { OrderConfirmationPage } from '@/routes/order-confirmation'
import { ProfilePage } from '@/routes/profile'
import { ProfileSectionPage } from '@/routes/profile-section'

function parsePage(
  value: unknown,
) {
  const parsed =
    Number(value)

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
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
  search: Record<
    string,
    unknown
  >,
): CatalogParams {
  const sort =
    allowedSorts.includes(
      search.sort as CatalogSort,
    )
      ? (
          search.sort as CatalogSort
        )
      : 'featured'

  const network =
    allowedNetworks.includes(
      search.network as NftNetwork,
    )
      ? (
          search.network as NftNetwork
        )
      : undefined

  const tab =
    allowedTabs.includes(
      search.tab as CatalogTab,
    )
      ? (
          search.tab as CatalogTab
        )
      : 'all'

  return {
    search:
      typeof search.search ===
        'string' &&
      search.search.trim()
        ? search.search
        : undefined,

    category:
      typeof search.category ===
        'string' &&
      search.category.trim()
        ? search.category
        : undefined,

    network,

    minPrice:
      typeof search.minPrice ===
      'string'
        ? search.minPrice
        : undefined,

    maxPrice:
      typeof search.maxPrice ===
      'string'
        ? search.maxPrice
        : undefined,

    sort,

    tab,

    page:
      parsePage(
        search.page,
      ),
  }
}

const rootRoute =
  createRootRoute({
    component: () => (
      <Outlet />
    ),
  })

const indexRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path: '/',

    validateSearch:
      validateCatalogSearch,

    component:
      HomePage,
  })

const nftDetailRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path:
      '/nft/$nftId',

    component:
      NftDetailPage,
  })

const cartRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path:
      '/cart',

    component:
      CartPage,
  })

const checkoutRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path:
      '/checkout',

    component: () => (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
  })

/*
 * Layout compartilhado de todas
 * as áreas do perfil.
 *
 * Este route possui o path /profile,
 * e os filhos são renderizados dentro
 * do Outlet.
 */
const profileRootRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path:
      '/profile',

    component: () => (
      <ProtectedRoute>
        <ProfileLayout>
          <Outlet />
        </ProfileLayout>
      </ProtectedRoute>
    ),
  })

const profileIndexRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path: '/',

    component:
      ProfilePage,
  })

const profileWalletsRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path:
      'wallets',

    component:
      ProfileWalletsPage,
  })

const profileActivityRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path:
      'activity',

    component:
      ProfileActivityPage,
  })

const profileFavoritesRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path:
      'favorites',

    component:
      ProfileFavoritesPage,
  })

const profileOffersRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path:
      'offers',

    component: () => (
      <ProfileSectionPage
        title="Ofertas"
        description="Consulte ofertas relacionadas à sua conta."
      />
    ),
  })

const profileDownloadsRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path:
      'downloads',

    component: () => (
      <ProfileSectionPage
        title="Arquivos baixados"
        description="Acesse arquivos disponibilizados pelas suas aquisições."
      />
    ),
  })

const profileSupportRoute =
  createRoute({
    getParentRoute:
      () =>
        profileRootRoute,

    path:
      'support',

    component: () => (
      <ProfileSectionPage
        title="Suporte"
        description="Encontre ajuda relacionada à sua conta e às suas compras."
      />
    ),
  })

const orderConfirmationRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path:
      '/orders/$orderId',

    /*
     * O backend já protege o
     * recurso, e agora a própria
     * interface também exige
     * autenticação.
     */
    component: () => (
      <ProtectedRoute>
        <OrderConfirmationPage />
      </ProtectedRoute>
    ),
  })

profileRootRoute.addChildren([
  profileIndexRoute,
  profileWalletsRoute,
  profileActivityRoute,
  profileFavoritesRoute,
  profileOffersRoute,
  profileDownloadsRoute,
  profileSupportRoute,
])

const routeTree =
  rootRoute.addChildren([
    indexRoute,
    nftDetailRoute,
    cartRoute,
    checkoutRoute,

    profileRootRoute.addChildren([
      profileIndexRoute,
      profileWalletsRoute,
      profileActivityRoute,
      profileFavoritesRoute,
      profileOffersRoute,
      profileDownloadsRoute,
      profileSupportRoute,
    ]),

    orderConfirmationRoute,
  ])

export const router =
  createRouter({
    routeTree,
  })

declare module '@tanstack/react-router' {
  interface Register {
    router:
      typeof router
  }
}