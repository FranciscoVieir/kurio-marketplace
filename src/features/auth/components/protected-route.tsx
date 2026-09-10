import {
  useState,
  type PropsWithChildren,
} from 'react'

import { Header } from '@/components/layout/header'
import { PageContainer } from '@/components/layout/page-container'

import { AuthDialog } from './auth-dialog'
import { useAuth } from '../hooks/use-auth'

export function ProtectedRoute({
  children,
}: PropsWithChildren) {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth()

  const [
    isAuthDialogOpen,
    setIsAuthDialogOpen,
  ] = useState(false)

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <PageContainer>
          <div className="flex min-h-[420px] items-center justify-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Carregando sua sessão...
            </p>
          </div>
        </PageContainer>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <PageContainer>
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 text-center">
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-foreground-kurio)]">
                Entre para continuar
              </h1>

              <p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
                Esta área está vinculada à sua conta de colecionador.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAuthDialogOpen(
                  true,
                )
              }}
              className="
                rounded-[var(--radius-control)]
                bg-[var(--color-primary-kurio)]
                px-5
                py-2.5
                text-sm
                font-medium
                text-[var(--color-ink)]
              "
            >
              Entrar
            </button>
          </div>
        </PageContainer>

        <AuthDialog
          open={
            isAuthDialogOpen
          }
          onClose={() => {
            setIsAuthDialogOpen(
              false,
            )
          }}
        />
      </div>
    )
  }

  return children
}