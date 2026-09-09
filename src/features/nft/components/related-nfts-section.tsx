import { useNfts } from '@/features/catalog/hooks/use-nfts'
import { NftRecommendations } from '@/features/nft/components/nft-recommendations'
import type { Nft } from '@/features/nft/types/nft'

type RelatedNftsSectionProps = {
  nft: Nft
}

export function RelatedNftsSection({
  nft,
}: RelatedNftsSectionProps) {
  const {
    data,
    isLoading,
    isError,
  } = useNfts({
    category: nft.category,
    page: 1,
  })

  const relatedNfts =
    data?.items
      .filter((item) => item.id !== nft.id)
      .slice(0, 5) ?? []

  if (isLoading) {
    return (
      <section className="mt-[72px]">
        <div className="border-b border-border pb-[10px]">
          <h2
            className="
              text-[14px] font-bold
              text-[var(--color-text-accent)]
            "
          >
            Mais desta coleção
          </h2>
        </div>

        <p className="mt-[20px] text-[12px] text-muted-foreground">
          Carregando itens relacionados...
        </p>
      </section>
    )
  }

  if (isError) {
    return null
  }

  return (
    <NftRecommendations
      title="Mais desta coleção"
      nfts={relatedNfts}
    />
  )
}