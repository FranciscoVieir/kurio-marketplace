import { Header } from '@/components/layout/header'
import { HeroSection } from '../features/home/components/hero-section'

export function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <Header />
      <HeroSection />
    </div>
  )
}