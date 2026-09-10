import {
  Download,
  FolderHeart,
  HandCoins,
  Headphones,
  LogOut,
  ShoppingCart,
  UserRound,
  WalletCards,
} from 'lucide-react'

import { Link } from '@tanstack/react-router'

import { useAuth } from '@/features/auth/hooks/use-auth'

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
  const { logout } = useAuth()

  return (
    <aside
      className="
        w-full
        border
        border-[var(--color-border-kurio)]
        bg-[var(--color-surface-card)]
        lg:w-[270px]
        lg:shrink-0
      "
    >
      <div className="px-5 py-4">
        <h2
          className="
            text-sm
            font-semibold
            text-[var(--color-foreground-kurio)]
          "
        >
          Meu perfil
        </h2>
      </div>

      <nav>
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{
                exact: item.exact,
              }}
              className="
                flex
                min-h-11
                items-center
                gap-3
                border-l-2
                border-transparent
                px-5
                text-xs
                text-[var(--color-text-accent)]
                transition
                hover:bg-white/5
              "
              activeProps={{
                className:
                  'border-l-[var(--color-primary-kurio)] bg-white/[0.025]',
              }}
            >
              <Icon
                size={15}
                strokeWidth={1.5}
              />

              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div
        className="
          mt-2
          border-t
          border-[var(--color-border-kurio)]
        "
      >
        <button
          type="button"
          onClick={() => {
            void logout()
          }}
          className="
            flex
            min-h-11
            w-full
            items-center
            gap-3
            px-5
            text-left
            text-xs
            text-[var(--color-text-accent)]
            transition
            hover:bg-white/5
          "
        >
          <LogOut
            size={15}
            strokeWidth={1.5}
          />

          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}