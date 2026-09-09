import { useNfts } from '@/features/catalog/hooks/use-nfts'
import { useCart } from '@/features/cart/hooks/use-cart'
import { NftRecommendations } from '@/features/nft/components/nft-recommendations'

export function CartRecommendations() {
  const {
    items,
  } = useCart()

  const {
    data,
    isLoading,
    isError,
  } = useNfts({
    tab: 'trending',
    page: 1,
  })

  const cartNftIds = new Set(
    items.map((item) => item.nftId),
  )

  const recommendedNfts =
    data?.items
      .filter(
        (nft) => !cartNftIds.has(nft.id),
      )
      .slice(0, 5) ?? []

  if (isLoading) {
    return (
      <section className="mt-18">
        <div className="border-b border-border pb-2.5">
          <h2
            className="
              text-[14px] font-bold
              text-[var(--color-text-accent)]
            "
          >
            Colecionadores também viram
          </h2>
        </div>

        <p
          className="
            mt-[20px]
            text-[12px]
            text-muted-foreground
          "
        >
          Carregando recomendações...
        </p>
      </section>
    )
  }

  if (
    isError ||
    recommendedNfts.length === 0
  ) {
    return null
  }

  return (
    <NftRecommendations
      title="Colecionadores também viram"
      nfts={recommendedNfts}
    />
  )
}