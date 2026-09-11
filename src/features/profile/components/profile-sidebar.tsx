import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Download,
  FolderHeart,
  HandCoins,
  Headphones,
  LogOut,
  ShoppingCart,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'

import {
  Link,
} from '@tanstack/react-router'

import {
  Button,
} from '@/components/ui/button'

import {
  useAuth,
} from '@/features/auth/hooks/use-auth'

type ProfileSidebarItem = {
  label: string
  to:
    | '/profile'
    | '/profile/wallets'
    | '/profile/activity'
    | '/profile/favorites'
    | '/profile/offers'
    | '/profile/downloads'
    | '/profile/support'
  icon: typeof UserRound
  exact?: boolean
}

const items: ProfileSidebarItem[] = [
  {
    label: 'Dados do perfil',
    to: '/profile',
    icon: UserRound,
    exact: true,
  },
  {
    label: 'Carteiras',
    to: '/profile/wallets',
    icon: WalletCards,
  },
  {
    label: 'Atividade',
    to: '/profile/activity',
    icon: ShoppingCart,
  },
  {
    label: 'Lista de interesse',
    to: '/profile/favorites',
    icon: FolderHeart,
  },
  {
    label: 'Ofertas',
    to: '/profile/offers',
    icon: HandCoins,
  },
  {
    label: 'Arquivos baixados',
    to: '/profile/downloads',
    icon: Download,
  },
  {
    label: 'Suporte',
    to: '/profile/support',
    icon: Headphones,
  },
]

export function ProfileSidebar() {
  const {
    logout,
  } = useAuth()

  const [
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
  ] = useState(false)

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false)

  const cancelButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    )

  useEffect(() => {
    if (
      !isLogoutDialogOpen
    ) {
      return
    }

    cancelButtonRef.current?.focus()

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        setIsLogoutDialogOpen(
          false,
        )
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    isLogoutDialogOpen,
  ])

  async function handleConfirmLogout() {
    if (
      isLoggingOut
    ) {
      return
    }

    setIsLoggingOut(
      true,
    )

    try {
      await logout()
    } finally {
      setIsLoggingOut(
        false,
      )

      setIsLogoutDialogOpen(
        false,
      )
    }
  }

  return (
    <>
      <aside
        className="
          w-full
          overflow-hidden
          rounded-lg
          border
          border-[var(--color-border-kurio)]
          bg-[var(--color-surface-card)]
          lg:w-67.5
          lg:shrink-0
        "
      >
        <div
          className="
            border-b
            border-[var(--color-border-kurio)]
            px-5
            py-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                size-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[rgba(210,138,76,0.24)]
                bg-[rgba(210,138,76,0.08)]
                text-[var(--color-text-accent)]
              "
            >
              <UserRound
                size={16}
                strokeWidth={1.6}
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  text-sm
                  font-semibold
                  leading-5
                  text-[var(--color-foreground-kurio)]
                "
              >
                Meu perfil
              </h2>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  leading-4
                  text-[var(--color-text-secondary)]
                "
              >
                Gerencie sua conta e preferências
              </p>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navegação do perfil"
          className="py-2"
        >
          {items.map(
            (item) => {
              const Icon =
                item.icon

              return (
                <Link
                  key={
                    item.to
                  }
                  to={
                    item.to
                  }
                  activeOptions={{
                    exact:
                      item.exact,
                  }}
                  className="
                    group
                    relative
                    flex
                    min-h-11
                    items-center
                    gap-3
                    border-l-2
                    border-transparent
                    px-5
                    text-xs
                    font-medium
                    text-[var(--color-text-secondary)]
                    transition
                    hover:bg-[rgba(245,241,235,0.025)]
                    hover:text-[var(--color-foreground-kurio)]
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-inset
                    focus-visible:ring-[var(--color-primary-kurio)]
                  "
                  activeProps={{
                    className:
                      'border-l-[var(--color-primary-kurio)] bg-[rgba(210,138,76,0.06)] text-[var(--color-text-accent)]',
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={
                      1.6
                    }
                    className="
                      shrink-0
                      transition
                      group-hover:text-[var(--color-text-accent)]
                    "
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>
                </Link>
              )
            },
          )}
        </nav>

        <div
          className="
            border-t
            border-[var(--color-border-kurio)]
            p-2
          "
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsLogoutDialogOpen(
                true,
              )
            }}
            className="
              h-11
              w-full
              justify-start
              gap-3
              rounded-md
              px-3
              text-xs
              font-medium
              text-[var(--color-text-secondary)]
              hover:bg-red-400/5
              hover:text-red-400
            "
          >
            <LogOut
              size={15}
              strokeWidth={1.6}
            />

            <span>
              Sair
            </span>
          </Button>
        </div>
      </aside>

      {isLogoutDialogOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            px-4
            backdrop-blur-[2px]
          "
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget &&
              !isLoggingOut
            ) {
              setIsLogoutDialogOpen(
                false,
              )
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            className="
              relative
              w-full
              max-w-105
              rounded-lg
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-surface-card)]
              p-6
              shadow-2xl
            "
          >
            <Button
              type="button"
              variant="ghost"
              aria-label="Fechar confirmação de saída"
              disabled={
                isLoggingOut
              }
              onClick={() => {
                setIsLogoutDialogOpen(
                  false,
                )
              }}
              className="
                absolute
                right-3
                top-3
                size-9
                rounded-full
                p-0
                text-[var(--color-text-secondary)]
                hover:bg-white/5
                hover:text-[var(--color-foreground-kurio)]
              "
            >
              <X
                size={16}
              />
            </Button>

            <div
              className="
                flex
                size-11
                items-center
                justify-center
                rounded-full
                border
                border-red-400/20
                bg-red-400/5
                text-red-400
              "
            >
              <LogOut
                size={18}
                strokeWidth={1.7}
              />
            </div>

            <h3
              id="logout-dialog-title"
              className="
                mt-5
                text-base
                font-semibold
                leading-6
                text-[var(--color-foreground-kurio)]
              "
            >
              Sair da sua conta?
            </h3>

            <p
              id="logout-dialog-description"
              className="
                mt-2
                text-xs
                leading-5
                text-[var(--color-text-secondary)]
              "
            >
              Você precisará entrar novamente para acessar seu perfil, carteiras, favoritos e histórico de compras.
            </p>

            <div
              className="
                mt-6
                flex
                justify-end
                gap-3
              "
            >
              <Button
                ref={
                  cancelButtonRef
                }
                type="button"
                variant="outline"
                disabled={
                  isLoggingOut
                }
                onClick={() => {
                  setIsLogoutDialogOpen(
                    false,
                  )
                }}
                className="
                  h-10
                  rounded-md
                  border-[var(--color-border-kurio)]
                  bg-transparent
                  px-4
                  text-xs
                  font-semibold
                  text-[var(--color-foreground-kurio)]
                  hover:bg-white/5
                  hover:text-[var(--color-foreground-kurio)]
                "
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={
                  isLoggingOut
                }
                onClick={() => {
                  void handleConfirmLogout()
                }}
                className="
                  h-10
                  rounded-md
                  bg-red-500
                  px-4
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-red-500
                  hover:opacity-90
                  disabled:opacity-50
                "
              >
                {isLoggingOut
                  ? 'Saindo...'
                  : 'Sim, sair'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
