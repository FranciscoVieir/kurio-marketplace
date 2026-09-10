import { useAuth } from '@/features/auth/hooks/use-auth'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
          Perfil do colecionador
        </h1>
      </div>

      <div className="border border-[var(--color-border-kurio)] bg-[var(--color-surface-card)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
          Dados do perfil
        </h2>

        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
          Os dados editáveis do colecionador serão carregados aqui.
        </p>

        {user && (
          <div className="mt-6 space-y-2 text-xs">
            <p className="text-[var(--color-text-secondary)]">
              Nome de exibição:{' '}
              <span className="text-[var(--color-foreground-kurio)]">
                {user.displayName}
              </span>
            </p>

            <p className="text-[var(--color-text-secondary)]">
              Usuário:{' '}
              <span className="text-[var(--color-foreground-kurio)]">
                {user.username}
              </span>
            </p>

            <p className="text-[var(--color-text-secondary)]">
              E-mail:{' '}
              <span className="text-[var(--color-foreground-kurio)]">
                {user.email}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}