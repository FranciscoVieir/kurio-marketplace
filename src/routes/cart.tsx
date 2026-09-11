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
        <PageContainer className="pt-[20px]">
          <nav
            aria-label="Breadcrumb"
            className="
              flex
              items-center
              gap-[8px]
              text-[12px]
              font-normal
              leading-[16px]
              text-[var(--color-text-secondary)]
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

            <span aria-hidden="true">
              /
            </span>

            <Link
              to="/"
              hash="catalog"
              className="
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              Mercado
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span className="text-[var(--color-foreground-kurio)]">
              Carrinho
            </span>
          </nav>
        </PageContainer>

        <PageContainer
          className="
            pb-[72px]
            pt-[24px]
          "
        >
          <section>
            <div>
              <h1
                className="
                  text-[28px]
                  font-bold
                  leading-[34px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Seu carrinho
              </h1>

              <p
                className="
                  mt-[6px]
                  text-[13px]
                  font-normal
                  leading-[20px]
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
                  mt-[28px]
                  flex
                  min-h-[360px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[10px]
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  px-[24px]
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-[56px]
                    w-[56px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--color-ink)]
                    text-[var(--color-text-accent)]
                  "
                >
                  <ShoppingCart
                    size={24}
                    strokeWidth={1.7}
                  />
                </div>

                <h2
                  className="
                    mt-[18px]
                    text-[18px]
                    font-bold
                    leading-[24px]
                    text-[var(--color-foreground-kurio)]
                  "
                >
                  Seu carrinho está vazio
                </h2>

                <p
                  className="
                    mt-[8px]
                    max-w-[400px]
                    text-[13px]
                    font-normal
                    leading-[21px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  Explore o mercado e encontre NFTs para
                  adicionar à sua coleção.
                </p>

                <Link
                  to="/"
                  hash="catalog"
                  className="
                    mt-[22px]
                    flex
                    h-[40px]
                    items-center
                    justify-center
                    rounded-[6px]
                    bg-[var(--color-primary-kurio)]
                    px-[22px]
                    text-[13px]
                    font-bold
                    text-[var(--color-ink)]
                    transition-opacity
                    hover:opacity-90
                  "
                >
                  EXPLORAR NFTs
                </Link>
              </div>
            ) : (
              <>
                <div
                  className="
                    mt-[28px]
                    grid
                    grid-cols-[minmax(0,1fr)_320px]
                    items-start
                    gap-[40px]
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

        <div className="">
          <BenefitsSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}