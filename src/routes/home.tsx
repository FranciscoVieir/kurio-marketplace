import { useSearch } from '@tanstack/react-router'
import { CatalogControls } from '@/features/catalog/components/catalog-controls'
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination'
import { useNfts } from '@/features/catalog/hooks/use-nfts'

export function HomePage() {
  const searchParams = useSearch({
    from: '/',
  })

  const {
    data,
    isLoading,
    isError,
  } = useNfts(searchParams)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        Carregando NFTs...
      </main>
    )
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        Erro ao carregar NFTs.
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Kurio Marketplace
        </h1>

        <CatalogControls params={searchParams} />

        {data?.items.length === 0 ? (
          <div className="rounded-lg border p-8">
            Nenhum NFT encontrado.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {data?.items.map((nft) => (
              <article
                key={nft.id}
                className="rounded-lg border p-4"
              >
                <strong>{nft.name}</strong>

                <p>{nft.priceEth} ETH</p>

                <small>
                  {nft.availableQuantity} disponíveis
                </small>
              </article>
            ))}
          </div>
        )}

        {data && (
          <CatalogPagination
            params={searchParams}
            total={data.total}
            pageSize={data.pageSize}
          />
        )}
      </div>
    </main>
  )
}