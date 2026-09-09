import { useSearch } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { HeroSection } from '@/features/home/components/hero-section'
import { CatalogSection } from '@/features/catalog/components/catalog-section'
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HeroSection />

      {isLoading && (
        <div className="mx-auto max-w-[1200px] py-10 text-muted-foreground">
          Carregando NFTs...
        </div>
      )}

      {isError && (
        <div className="mx-auto max-w-[1200px] py-10 text-destructive">
          Erro ao carregar NFTs.
        </div>
      )}

      {data && (
        <CatalogSection
          params={searchParams}
          nfts={data.items}
          total={data.total}
          pageSize={data.pageSize}
        />
      )}
    </div>
  )
}