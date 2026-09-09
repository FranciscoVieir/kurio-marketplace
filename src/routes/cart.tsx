import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { CartItemsList } from '@/features/cart/components/cart-items-list'
import { CartRecommendations } from '@/features/cart/components/cart-recommendations'
import { CartSummary } from '@/features/cart/components/cart-summary'
import { useCart } from '@/features/cart/hooks/use-cart'
import { BenefitsSection } from '@/features/home/components/benefits-section'

export function CartPage() {
  const {
    totalItems,
    isEmpty,
  } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <PageContainer className="pt-6">
          <div
            className="
              flex items-center gap-2
              text-[11px]
              text-muted-foreground
            "
          >
            <Link
              to="/"
              className="
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              Início
            </Link>

            <span>/</span>

            <span>Mercado</span>

            <span>/</span>

            <span className="text-foreground">
              Carrinho
            </span>
          </div>
        </PageContainer>

        <PageContainer className="pb-18 pt-6">
          <section>
            <div>
              <h1
                className="
                  text-[24px] font-bold
                  leading-[30px]
                  text-foreground
                "
              >
                Seu carrinho
              </h1>

              <p
                className="
                  mt-1.5
                  text-[11px]
                  text-[var(--color-text-secondary)]
                "
              >
                {isEmpty
                  ? 'Seu carrinho está vazio.'
                  : `${totalItems} ${
                      totalItems === 1
                        ? 'item'
                        : 'itens'
                    } no carrinho`}
              </p>
            </div>

            {isEmpty ? (
              <div
                className="
                  mt-8
                  flex min-h-[300px]
                  flex-col
                  items-center justify-center
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  px-6
                  text-center
                "
              >
                <div
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-full
                    bg-[var(--color-ink)]
                    text-[var(--color-text-accent)]
                  "
                >
                  <ShoppingCart
                    size={21}
                    strokeWidth={1.7}
                  />
                </div>

                <h2
                  className="
                    mt-4
                    text-[14px] font-bold
                    text-foreground
                  "
                >
                  Seu carrinho está vazio
                </h2>

                <p
                  className="
                    mt-2 max-w-[360px]
                    text-[11px] leading-[18px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  Explore o mercado e adicione NFTs à
                  sua coleção para continuar.
                </p>

                <Link
                  to="/"
                  className="
                    mt-5
                    flex h-9
                    items-center justify-center
                    rounded-[6px]
                    bg-[var(--color-primary-kurio)]
                    px-5
                    text-[11px] font-bold
                    text-[var(--color-ink)]
                  "
                >
                  Explorar NFTs
                </Link>
              </div>
            ) : (
              <>
                <div
                  className="
                    mt-7
                    grid
                    grid-cols-[minmax(0,1fr)_280px]
                    items-start
                    gap-10
                  "
                >
                  <CartItemsList />

                  <CartSummary />
                </div>

                <CartRecommendations />
              </>
            )}
          </section>
        </PageContainer>

        <div className="pb-18">
          <BenefitsSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}