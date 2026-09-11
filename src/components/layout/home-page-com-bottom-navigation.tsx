import { useSearch } from '@tanstack/react-router'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { MobileBottomNavigation } from '@/components/layout/mobile-bottom-navigation'
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
    isFetching,
    isError,
    refetch,
  } = useNfts(searchParams)

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-background
      "
    >
      <Header />

      <main>
        <HeroSection />

        <CatalogSection
          params={searchParams}
          nfts={data?.items ?? []}
          total={data?.total ?? 0}
          pageSize={
            data?.pageSize ?? 9
          }
          isLoading={
            isLoading ||
            isFetching
          }
          isError={isError}
          onRetry={() => {
            void refetch()
          }}
        />

        <div
          className="
            space-y-8
            lg:space-y-12
          "
        >
          <EditorialSection />

          <JournalSection />

          <BenefitsSection />
        </div>
      </main>

      <Footer />

      <MobileBottomNavigation />
    </div>
  )
}
