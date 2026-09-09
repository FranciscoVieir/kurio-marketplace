import {
  LogIn,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { PageContainer } from './page-container'

const navigation = [
  { label: 'Início', active: true },
  { label: 'Mercado', active: false },
  { label: 'Criadores', active: false },
  { label: 'Aprenda', active: false },
]

export function Header() {
  return (
    <header className="bg-[var(--color-ink)]">
      <PageContainer>
        <div
          className="
            flex h-[45px] items-center
            border-b border-[var(--color-border-kurio)]
          "
        >
          <div
            className="
              text-[14px] font-bold leading-[14px]
              tracking-[0.1em]
              text-[var(--color-foreground-kurio)]
            "
          >
            KURIO
          </div>

          <nav
            aria-label="Navegação principal"
            className="ml-[180px] flex h-full items-center gap-6"
          >
            {navigation.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`
                  relative h-full
                  text-[16px] font-normal leading-[16px]
                  ${
                    item.active
                      ? 'text-[var(--color-text-accent)]'
                      : 'text-[var(--color-foreground-kurio)]'
                  }
                `}
              >
                {item.label}

                {item.active && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute bottom-0 left-0
                      h-[3px] w-full
                      bg-[var(--color-primary-kurio)]
                    "
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-5">
            <button
              type="button"
              aria-label="Pesquisar"
              className="text-[var(--color-foreground-kurio)]"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label="Carrinho com 6 itens"
              className="
                relative flex h-7 w-7 items-center justify-center
                text-[var(--color-foreground-kurio)]
              "
            >
              <ShoppingCart size={20} strokeWidth={1.8} />

              <span
                className="
                  absolute -right-1 -top-1
                  flex h-4 w-4 items-center justify-center
                  rounded-full
                  border-2 border-[var(--color-ink)]
                  bg-[var(--color-primary-kurio)]
                  text-[9px] font-bold
                  text-[var(--color-ink)]
                "
              >
                6
              </span>
            </button>

            <button
              type="button"
              className="
                flex h-[35px] w-[100px]
                items-center justify-center gap-1
                rounded-[6px]
                bg-[var(--color-primary-kurio)]
                text-[16px] font-medium leading-[16px]
                text-[var(--color-ink)]
              "
            >
              <LogIn size={20} />

              Entrar
            </button>
          </div>
        </div>
      </PageContainer>
    </header>
  )
}