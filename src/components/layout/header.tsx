import {
  LogIn,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'

import {
  Link,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'

import {
  useEffect,
  useState,
} from 'react'

import { AuthDialog } from '@/features/auth/components/auth-dialog'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCart } from '@/features/cart/hooks/use-cart'

import { PageContainer } from './page-container'

type HomeSection =
  | 'home'
  | 'catalog'
  | 'creators'
  | 'learn'

type NavigationItem = {
  label: string
  section: HomeSection
}

const navigation: NavigationItem[] = [
  {
    label: 'Início',
    section: 'home',
  },
  {
    label: 'Mercado',
    section: 'catalog',
  },
  {
    label: 'Criadores',
    section: 'creators',
  },
  {
    label: 'Aprenda',
    section: 'learn',
  },
]

export function Header() {
  const [
    isAuthDialogOpen,
    setIsAuthDialogOpen,
  ] = useState(false)

  const [
    activeSection,
    setActiveSection,
  ] = useState<HomeSection>(
    'home',
  )

  const navigate =
    useNavigate()

  const pathname =
    useRouterState({
      select: (state) =>
        state.location.pathname,
    })

  const {
    totalItems,
  } = useCart()

  const {
    isAuthenticated,
    isInitializing,
  } = useAuth()

  const isHome =
    pathname === '/'

  const isMarketRoute =
    pathname.startsWith(
      '/nft/',
    ) ||
    pathname === '/market' ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname.startsWith(
      '/orders/',
    )

  const isProfile =
    pathname === '/profile'

  useEffect(() => {
    if (!isHome) {
      return
    }

    const hash =
      window.location.hash.replace(
        '#',
        '',
      )

    if (
      hash === 'home' ||
      hash === 'catalog' ||
      hash === 'creators' ||
      hash === 'learn'
    ) {
      setActiveSection(
        hash,
      )
    }
  }, [isHome])

  function updateHash(
    section: HomeSection,
  ) {
    const url =
      new URL(
        window.location.href,
      )

    url.hash =
      section

    window.history.replaceState(
      window.history.state,
      '',
      url,
    )
  }

  function scrollToSection(
    section: HomeSection,
  ) {
    const element =
      document.getElementById(
        section,
      )

    if (!element) {
      return
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    setActiveSection(
      section,
    )

    updateHash(
      section,
    )
  }

  async function goToSection(
    section: HomeSection,
  ) {
    if (isHome) {
      scrollToSection(
        section,
      )

      return
    }

    await navigate({
      to: '/',
      resetScroll: false,
    })

    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            scrollToSection(
              section,
            )
          },
        )
      },
    )
  }

  function isSectionActive(
    section: HomeSection,
  ) {
    if (
      section ===
        'catalog' &&
      isMarketRoute
    ) {
      return true
    }

    if (!isHome) {
      return false
    }

    return (
      activeSection ===
      section
    )
  }

  return (
    <>
      <header
        className="
          bg-[var(--color-ink)]
        "
      >
        {/* Mobile: busca + filtro conforme o Figma. */}
        <div
          className="
            px-6
            pt-6
            pb-3
            lg:hidden
          "
        >
          <div
            className="
              flex
              h-[45px]
              w-full
              items-center
              gap-2
            "
          >
            <button
              type="button"
              aria-label="Explorar coleções de NFTs"
              onClick={() =>
                void goToSection(
                  'catalog',
                )
              }
              className="
                flex
                h-[45px]
                min-w-0
                flex-1
                items-center
                gap-2
                rounded-[10px]
                bg-[var(--color-surface-card)]
                px-3
                text-left
                text-[14px]
                font-bold
                leading-[16px]
                text-[var(--color-secondary)]
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              <Search
                className="
                  size-[22px]
                  shrink-0
                "
                strokeWidth={1.8}
              />

              <span
                className="
                  truncate
                "
              >
                Explorar coleções
              </span>
            </button>

            <button
              type="button"
              aria-label="Ir para os filtros do mercado"
              onClick={() =>
                void goToSection(
                  'catalog',
                )
              }
              className="
                flex
                size-[45px]
                shrink-0
                items-center
                justify-center
                rounded-[14px]
                bg-[linear-gradient(137.05deg,rgba(210,138,76,0.45)_-24.6%,#D28A4C_100%)]
                text-[var(--color-ink)]
                transition-opacity
                hover:opacity-90
              "
            >
              <SlidersHorizontal
                className="
                  size-[21px]
                "
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>

        {/* Desktop: preservado exatamente como estava. */}
        <div
          className="
            hidden
            lg:block
          "
        >
          <PageContainer>
            <div
              className="
                flex
                h-[55px]
                items-center
                border-b
                border-[var(--color-border-kurio)]
              "
            >
              <button
                type="button"
                onClick={() =>
                  void goToSection(
                    'home',
                  )
                }
                className="
                  text-[14px]
                  font-bold
                  leading-[14px]
                  tracking-[0.1em]
                  text-[var(--color-foreground-kurio)]
                  transition-colors
                  hover:text-[var(--color-text-accent)]
                "
              >
                KURIO
              </button>

              <nav
                aria-label="Navegação principal"
                className="
                  ml-[180px]
                  flex
                  h-full
                  items-center
                  gap-6
                "
              >
                {navigation.map(
                  (item) => {
                    const active =
                      isSectionActive(
                        item.section,
                      )

                    return (
                      <button
                        key={
                          item.label
                        }
                        type="button"
                        onClick={() =>
                          void goToSection(
                            item.section,
                          )
                        }
                        className={`
                          relative
                          flex
                          h-full
                          items-center
                          text-[16px]
                          font-normal
                          leading-[16px]
                          transition-colors
                          ${
                            active
                              ? 'text-[var(--color-text-accent)]'
                              : 'text-[var(--color-foreground-kurio)] hover:text-[var(--color-text-accent)]'
                          }
                        `}
                      >
                        {
                          item.label
                        }

                        {active && (
                          <span
                            aria-hidden="true"
                            className="
                              absolute
                              bottom-0
                              left-0
                              h-[3px]
                              w-full
                              bg-[var(--color-primary-kurio)]
                            "
                          />
                        )}
                      </button>
                    )
                  },
                )}
              </nav>

              <div
                className="
                  ml-auto
                  flex
                  items-center
                  gap-5
                "
              >
                <button
                  type="button"
                  aria-label="Ir para a busca de NFTs"
                  onClick={() =>
                    void goToSection(
                      'catalog',
                    )
                  }
                  className="
                    text-[var(--color-foreground-kurio)]
                    transition-colors
                    hover:text-[var(--color-text-accent)]
                  "
                >
                  <Search
                    size={20}
                    strokeWidth={
                      1.8
                    }
                  />
                </button>

                <Link
                  to="/cart"
                  aria-label={
                    totalItems ===
                    0
                      ? 'Carrinho vazio'
                      : `Carrinho com ${totalItems} ${
                          totalItems ===
                          1
                            ? 'item'
                            : 'itens'
                        }`
                  }
                  className="
                    relative
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    text-[var(--color-foreground-kurio)]
                    transition-colors
                    hover:text-[var(--color-text-accent)]
                  "
                >
                  <ShoppingCart
                    size={20}
                    strokeWidth={
                      1.8
                    }
                  />

                  {totalItems >
                    0 && (
                    <span
                      className="
                        absolute
                        -right-1
                        -top-1
                        flex
                        h-4
                        min-w-4
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-[var(--color-ink)]
                        bg-[var(--color-primary-kurio)]
                        px-[2px]
                        text-[9px]
                        font-bold
                        leading-none
                        text-[var(--color-ink)]
                      "
                    >
                      {totalItems >
                      99
                        ? '99+'
                        : totalItems}
                    </span>
                  )}
                </Link>

                {isInitializing ? (
                  <div
                    aria-label="Verificando sessão"
                    className="
                      h-[35px]
                      w-[100px]
                      animate-pulse
                      rounded-[6px]
                      bg-[var(--color-surface-card)]
                    "
                  />
                ) : isAuthenticated ? (
                  <Link
                    to="/profile"
                    className={`
                      flex
                      h-[35px]
                      min-w-[112px]
                      items-center
                      justify-center
                      gap-1.5
                      rounded-[6px]
                      px-3
                      text-[16px]
                      font-medium
                      leading-[16px]
                      transition-colors
                      ${
                        isProfile
                          ? `
                              bg-[var(--color-text-accent)]
                              text-[var(--color-ink)]
                            `
                          : `
                              bg-[var(--color-primary-kurio)]
                              text-[var(--color-ink)]
                            `
                      }
                    `}
                  >
                    <UserRound
                      size={19}
                      strokeWidth={
                        1.9
                      }
                    />

                    Meu perfil
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setIsAuthDialogOpen(
                        true,
                      )
                    }
                    className="
                      flex
                      h-[35px]
                      w-[100px]
                      items-center
                      justify-center
                      gap-1
                      rounded-[6px]
                      bg-[var(--color-primary-kurio)]
                      text-[16px]
                      font-medium
                      leading-[16px]
                      text-[var(--color-ink)]
                    "
                  >
                    <LogIn
                      size={20}
                    />

                    Entrar
                  </button>
                )}
              </div>
            </div>
          </PageContainer>
        </div>
      </header>

      <AuthDialog
        open={
          isAuthDialogOpen
        }
        onClose={() =>
          setIsAuthDialogOpen(
            false,
          )
        }
      />
    </>
  )
}