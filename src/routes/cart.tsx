import {
  Link,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  ShoppingCart,
} from 'lucide-react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { MobileBottomNavigation } from '@/components/layout/mobile-bottom-navigation'
import { PageContainer } from '@/components/layout/page-container'
import { CartItemsList } from '@/features/cart/components/cart-items-list'
import { CartRecommendations } from '@/features/cart/components/cart-recommendations'
import { CartSummary } from '@/features/cart/components/cart-summary'
import { useCart } from '@/features/cart/hooks/use-cart'
import { BenefitsSection } from '@/features/home/components/benefits-section'

export function CartPage() {
  const navigate =
    useNavigate()

  const {
    totalItems,
    isEmpty,
  } = useCart()

  function handleBack() {
    if (
      window.history.length >
      1
    ) {
      window.history.back()
      return
    }

    void navigate({
      to: '/',
    })
  }

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-background
      "
    >
      {/* Desktop */}
      <div className="hidden lg:block">
        <Header />
      </div>

      <main>
        {/* Mobile: navegação local da tela */}
        <div
          className="
            px-6
            pt-6
            lg:hidden
          "
        >
          <button
            type="button"
            aria-label="Voltar"
            onClick={
              handleBack
            }
            className="
              flex
              size-[35px]
              items-center
              justify-center
              rounded-full
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-surface-card)]
              text-[var(--color-text-accent)]
              transition-colors
              hover:bg-[var(--color-surface-raised,#2F1D15)]
            "
          >
            <ArrowLeft
              size={18}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Desktop breadcrumb */}
        <PageContainer
          className="
            hidden
            pt-[20px]
            lg:block
          "
        >
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
            px-6
            pt-5
            pb-10
            lg:px-0
            lg:pt-[24px]
            lg:pb-[72px]
          "
        >
          <section>
            <div>
              <h1
                className="
                  text-[22px]
                  font-bold
                  leading-[28px]
                  text-[var(--color-foreground-kurio)]
                  lg:text-[28px]
                  lg:leading-[34px]
                "
              >
                Seu carrinho
              </h1>

              <p
                className="
                  mt-1.5
                  text-[12px]
                  font-normal
                  leading-[18px]
                  text-[var(--color-text-secondary)]
                  lg:text-[13px]
                  lg:leading-[20px]
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
                  mt-6
                  flex
                  min-h-[300px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[12px]
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  px-5
                  text-center
                  lg:mt-[28px]
                  lg:min-h-[360px]
                  lg:rounded-[10px]
                  lg:px-[24px]
                "
              >
                <div
                  className="
                    flex
                    size-[52px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--color-ink)]
                    text-[var(--color-text-accent)]
                    lg:h-[56px]
                    lg:w-[56px]
                  "
                >
                  <ShoppingCart
                    size={24}
                    strokeWidth={1.7}
                  />
                </div>

                <h2
                  className="
                    mt-4
                    text-[18px]
                    font-bold
                    leading-[24px]
                    text-[var(--color-foreground-kurio)]
                    lg:mt-[18px]
                  "
                >
                  Seu carrinho está vazio
                </h2>

                <p
                  className="
                    mt-2
                    max-w-[320px]
                    text-[12px]
                    font-normal
                    leading-[18px]
                    text-[var(--color-text-secondary)]
                    lg:max-w-[400px]
                    lg:text-[13px]
                    lg:leading-[21px]
                  "
                >
                  Explore o mercado e encontre NFTs para
                  adicionar à sua coleção.
                </p>

                <Link
                  to="/"
                  hash="catalog"
                  className="
                    mt-5
                    flex
                    h-10
                    items-center
                    justify-center
                    rounded-[6px]
                    bg-[var(--color-primary-kurio)]
                    px-5
                    text-[13px]
                    font-bold
                    text-[var(--color-ink)]
                    transition-opacity
                    hover:opacity-90
                    lg:mt-[22px]
                    lg:px-[22px]
                  "
                >
                  EXPLORAR NFTs
                </Link>
              </div>
            ) : (
              <>
                <div
                  className="
                    mt-6
                    grid
                    grid-cols-1
                    items-start
                    gap-6
                    lg:mt-[28px]
                    lg:grid-cols-[minmax(0,1fr)_320px]
                    lg:gap-[40px]
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

        <div className="lg:block">
          <BenefitsSection />
        </div>
      </main>

      <Footer />

      <MobileBottomNavigation />
    </div>
  )
}
