import { useParams } from '@tanstack/react-router'

import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'
import { useNft } from '@/features/nft/hooks/use-nft'

export function NftDetailPage() {
  const { nftId } = useParams({
    from: '/nft/$nftId',
  })

  const {
    data: nft,
    isLoading,
    isError,
  } = useNft(nftId)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <PageContainer className="py-12">
          {isLoading && (
            <p className="text-muted-foreground">
              Carregando NFT...
            </p>
          )}

          {isError && (
            <p className="text-destructive">
              NFT não encontrado.
            </p>
          )}

          {nft && (
            <section className="flex items-start gap-10">
              <div
                className="
                  h-[450px] w-[450px]
                  shrink-0 overflow-hidden
                  rounded-[24px]
                  bg-card
                "
              >
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="
                      flex h-full w-full
                      items-center justify-center
                      text-muted-foreground
                    "
                  >
                    NFT
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    text-[14px] font-medium
                    uppercase tracking-[0.1em]
                    text-[var(--color-text-accent)]
                  "
                >
                  {nft.collection}
                </p>

                <h1
                  className="
                    mt-4 text-[36px]
                    font-bold leading-tight
                    text-foreground
                  "
                >
                  {nft.name}
                </h1>

                <p className="mt-2 text-[15px] text-muted-foreground">
                  {nft.tokenId}
                </p>

                <div className="mt-8">
                  <p className="text-[14px] text-muted-foreground">
                    Preço atual
                  </p>

                  <p
                    className="
                      mt-2 text-[24px]
                      font-bold
                      text-[var(--color-text-accent)]
                    "
                  >
                    {nft.priceEth} ETH
                  </p>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[13px] text-muted-foreground">
                        Rede
                      </p>

                      <p className="mt-1 text-[15px] capitalize text-foreground">
                        {nft.network}
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] text-muted-foreground">
                        Categoria
                      </p>

                      <p className="mt-1 text-[15px] text-foreground">
                        {nft.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] text-muted-foreground">
                        Disponíveis
                      </p>

                      <p className="mt-1 text-[15px] text-foreground">
                        {nft.availableQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </PageContainer>
      </main>
    </div>
  )
}