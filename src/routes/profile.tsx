import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageContainer>
        <main className="py-10">
          <h1
            className="
              text-2xl font-semibold
              text-[var(--color-foreground-kurio)]
            "
          >
            Meu perfil
          </h1>

          <p
            className="
              mt-3
              text-[var(--color-text-secondary)]
            "
          >
            A área do colecionador será construída aqui.
          </p>
        </main>
      </PageContainer>
    </div>
  )
}