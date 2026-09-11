import {
  Heart,
  Home,
  ShoppingCart,
  UserRound,
  WalletCards,
} from 'lucide-react'

import {
  Link,
  useRouterState,
} from '@tanstack/react-router'

import { useCart } from '@/features/cart/hooks/use-cart'

export function MobileBottomNavigation() {
  const {
    totalItems,
  } = useCart()

  const pathname =
    useRouterState({
      select: (state) =>
        state.location.pathname,
    })

  const isHome =
    pathname === '/'

  const isFavorites =
    pathname ===
      '/profile/favorites' ||
    pathname.startsWith(
      '/profile/favorites/',
    )

  const isWallets =
    pathname ===
      '/profile/wallets' ||
    pathname.startsWith(
      '/profile/wallets/',
    )

  const isCart =
    pathname === '/cart'

  const isProfile =
    pathname === '/profile' ||
    (
      pathname.startsWith(
        '/profile/',
      ) &&
      !isFavorites &&
      !isWallets
    )

  function itemClass(
    active: boolean,
  ) {
    return `
      flex
      h-12
      items-center
      justify-center
      transition-colors
      ${
        active
          ? 'text-[var(--color-text-accent)]'
          : 'text-[var(--color-foreground-kurio)] hover:text-[var(--color-text-accent)]'
      }
    `
  }

  return (
    <nav
      aria-label="Navegação mobile"
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        lg:hidden
      "
    >
      <div
        className="
          relative
          mx-auto
          h-[95px]
          w-full
          max-w-[414px]
          rounded-t-[28px]
          bg-[var(--color-surface-card)]
          shadow-[0_-10px_30px_0_#0A060473]
        "
      >
        <div
          className="
            grid
            h-full
            grid-cols-5
            items-center
            px-4
            pt-4
          "
        >
          <Link
            to="/"
            aria-label="Início"
            aria-current={
              isHome
                ? 'page'
                : undefined
            }
            className={
              itemClass(
                isHome,
              )
            }
          >
            <Home
              className="
                h-[17px]
                w-[16px]
              "
              strokeWidth={
                isHome
                  ? 2.2
                  : 1.8
              }
            />
          </Link>

          <Link
            to="/profile/favorites"
            aria-label="Favoritos"
            aria-current={
              isFavorites
                ? 'page'
                : undefined
            }
            className={
              itemClass(
                isFavorites,
              )
            }
          >
            <Heart
              className="
                size-5
              "
              strokeWidth={
                isFavorites
                  ? 2.2
                  : 1.8
              }
            />
          </Link>

          <div
            className="
              relative
              flex
              h-12
              items-center
              justify-center
            "
          >
            <Link
              to="/profile/wallets"
              aria-label="Carteiras"
              aria-current={
                isWallets
                  ? 'page'
                  : undefined
              }
              className={`
                absolute
                -top-[42px]
                flex
                size-[65px]
                items-center
                justify-center
                rounded-full
                bg-[linear-gradient(180deg,rgba(210,138,76,0.4)_-16.92%,#D28A4C_109.23%)]
                text-[var(--color-ink)]
                shadow-[0_10px_24px_rgba(0,0,0,0.28)]
                transition-transform
                ${
                  isWallets
                    ? 'scale-105 ring-2 ring-[var(--color-text-accent)]'
                    : ''
                }
              `}
            >
              <WalletCards
                className="
                  size-6
                "
                strokeWidth={
                  isWallets
                    ? 2.2
                    : 1.9
                }
              />
            </Link>
          </div>

          <Link
            to="/cart"
            aria-label={
              totalItems === 0
                ? 'Carrinho'
                : `Carrinho com ${totalItems} ${
                    totalItems === 1
                      ? 'item'
                      : 'itens'
                  }`
            }
            aria-current={
              isCart
                ? 'page'
                : undefined
            }
            className={`
              relative
              ${itemClass(
                isCart,
              )}
            `}
          >
            <ShoppingCart
              className="
                size-5
              "
              strokeWidth={
                isCart
                  ? 2.2
                  : 1.8
              }
            />

            {totalItems > 0 && (
              <span
                className="
                  absolute
                  top-1
                  right-3
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-primary-kurio)]
                  px-1
                  text-[9px]
                  font-bold
                  leading-none
                  text-[var(--color-ink)]
                "
              >
                {totalItems > 99
                  ? '99+'
                  : totalItems}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            aria-label="Perfil"
            aria-current={
              isProfile
                ? 'page'
                : undefined
            }
            className={
              itemClass(
                isProfile,
              )
            }
          >
            <UserRound
              className="
                size-5
              "
              strokeWidth={
                isProfile
                  ? 2.2
                  : 1.8
              }
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}
