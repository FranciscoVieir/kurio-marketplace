import type {
  PropsWithChildren,
} from 'react'

import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'

import { ProfileSidebar } from './profile-sidebar'

export function ProfileLayout({
  children,
}: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageContainer>
        <div
          className="
            flex
            flex-col
            gap-6
            py-8
            lg:flex-row
            lg:items-start
          "
        >
          <ProfileSidebar />

          <main
            className="
              min-w-0
              flex-1
            "
          >
            {children}
          </main>
        </div>
      </PageContainer>
    </div>
  )
}