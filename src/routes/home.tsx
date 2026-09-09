import { useNfts } from '@/features/catalog/hooks/use-nfts'
import { useSearch } from '@tanstack/react-router'

export function HomePage() {
  const searchParams = useSearch({
    from: '/',
  })

  const { data, isLoading, isError } = useNfts(searchParams)

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

        <pre className="mb-8 rounded-lg border p-4 text-sm">
          {JSON.stringify(searchParams, null, 2)}
        </pre>

        <div className="grid gap-4 md:grid-cols-3">
          {data?.items.map((nft) => (
            <article
              key={nft.id}
              className="rounded-lg border p-4"
            >
              <strong>{nft.name}</strong>
              <p>{nft.priceEth} ETH</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}