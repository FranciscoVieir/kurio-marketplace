import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { useCart } from '@/features/cart/hooks/use-cart'
import { BenefitsSection } from '@/features/home/components/benefits-section'

export function CartPage() {
  const {
    items,
    totalItems,
    isEmpty,
  } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <PageContainer className="py-[32px]">
          <p className="text-[12px] text-muted-foreground">
            Início / Carrinho
          </p>

          <div className="mt-[24px]">
            <h1 className="text-[28px] font-bold text-foreground">
              Seu carrinho
            </h1>

            <p className="mt-[6px] text-[13px] text-muted-foreground">
              {isEmpty
                ? 'Seu carrinho está vazio.'
                : `${totalItems} ${
                    totalItems === 1
                      ? 'item'
                      : 'itens'
                  } no carrinho.`}
            </p>
          </div>

          {isEmpty ? (
            <div
              className="
                mt-[40px]
                flex min-h-[320px]
                items-center justify-center
                border border-border
                bg-card
              "
            >
              <p className="text-[14px] text-muted-foreground">
                Nenhum NFT foi adicionado ainda.
              </p>
            </div>
          ) : (
            <div className="mt-[32px] space-y-[16px]">
              {items.map((item) => (
                <article
                  key={item.nftId}
                  className="
                    flex items-center gap-[20px]
                    border border-border
                    bg-card
                    p-[16px]
                  "
                >
                  <div
                    className="
                      h-[96px] w-[96px]
                      shrink-0 overflow-hidden
                      rounded-[8px]
                      bg-background
                    "
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="
                          flex h-full items-center justify-center
                          text-muted-foreground
                        "
                      >
                        NFT
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-foreground">
                      {item.name}
                    </p>

                    <p className="mt-[4px] text-[12px] text-muted-foreground">
                      {item.collection}
                    </p>

                    <p
                      className="
                        mt-[8px]
                        text-[14px] font-bold
                        text-[var(--color-text-accent)]
                      "
                    >
                      {item.priceEth} ETH
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[12px] text-muted-foreground">
                      Quantidade
                    </p>

                    <p className="mt-[4px] text-[14px] font-bold text-foreground">
                      {item.quantity}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </PageContainer>

        <div className="pb-[72px] pt-[72px]">
          <BenefitsSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}