import { useSearch } from '@tanstack/react-router'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { CatalogSection } from '@/features/catalog/components/catalog-section'
import { useNfts } from '@/features/catalog/hooks/use-nfts'
import { BenefitsSection } from '@/features/home/components/benefits-section'
import { EditorialSection } from '@/features/home/components/editorial-section'
import { HeroSection } from '@/features/home/components/hero-section'
import { JournalSection } from '@/features/home/components/journal-section'

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

      <main>
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

        <div className="space-y-[72px] pb-[72px]">
          <EditorialSection />

          <JournalSection />

          <BenefitsSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}