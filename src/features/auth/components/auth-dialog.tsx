import {
  useEffect,
  useState,
} from 'react'
import {
  Eye,
  EyeOff,
  X,
} from 'lucide-react'
import { isAxiosError } from 'axios'

import { useAuth } from '@/features/auth/hooks/use-auth'

type AuthMode =
  | 'login'
  | 'register'

type AuthDialogProps = {
  open: boolean
  onClose: () => void
}

function getApiErrorMessage(
  error: unknown,
) {
  if (
    isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  return 'Não foi possível concluir a autenticação.'
}

export function AuthDialog({
  open,
  onClose,
}: AuthDialogProps) {
  const {
    login,
    register,
  } = useAuth()

  const [
    mode,
    setMode,
  ] =
    useState<AuthMode>(
      'login',
    )

  const [
    username,
    setUsername,
  ] =
    useState('')

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setErrorMessage(null)
  }, [open])

  useEffect(() => {
    setErrorMessage(null)
  }, [mode])

  if (!open) {
    return null
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      if (
        mode === 'login'
      ) {
        await login({
          email,
          password,
        })
      } else {
        await register({
          username,
          email,
          password,
          confirmPassword,
        })
      }

      onClose()
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70
        px-5 py-8
      "
      role="presentation"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="
          relative
          w-full max-w-[430px]
          rounded-[10px]
          border border-[var(--color-border-kurio)]
          bg-[var(--color-surface-card)]
          px-8 pb-8 pt-7
          shadow-2xl
        "
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="
            absolute right-4 top-4
            text-[var(--color-text-secondary)]
            transition-colors
            hover:text-[var(--color-foreground-kurio)]
          "
        >
          <X
            size={20}
            strokeWidth={1.8}
          />
        </button>

        <div
          className="
            mb-7 flex
            border-b
            border-[var(--color-border-kurio)]
          "
        >
          <button
            type="button"
            onClick={() =>
              setMode(
                'login',
              )
            }
            className={`
              relative flex-1
              pb-3
              text-[15px]
              font-medium
              ${
                mode ===
                'login'
                  ? 'text-[var(--color-text-accent)]'
                  : 'text-[var(--color-text-secondary)]'
              }
            `}
          >
            Entrar

            {mode ===
              'login' && (
              <span
                className="
                  absolute
                  bottom-0 left-0
                  h-[2px] w-full
                  bg-[var(--color-primary-kurio)]
                "
              />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setMode(
                'register',
              )
            }
            className={`
              relative flex-1
              pb-3
              text-[15px]
              font-medium
              ${
                mode ===
                'register'
                  ? 'text-[var(--color-text-accent)]'
                  : 'text-[var(--color-text-secondary)]'
              }
            `}
          >
            Criar conta

            {mode ===
              'register' && (
              <span
                className="
                  absolute
                  bottom-0 left-0
                  h-[2px] w-full
                  bg-[var(--color-primary-kurio)]
                "
              />
            )}
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <div>
            <h2
              id="auth-dialog-title"
              className="
                text-[22px]
                font-semibold
                text-[var(--color-foreground-kurio)]
              "
            >
              {mode ===
              'login'
                ? 'Bem-vindo de volta'
                : 'Crie sua conta'}
            </h2>

            <p
              className="
                mt-2
                text-[13px]
                leading-5
                text-[var(--color-text-secondary)]
              "
            >
              {mode ===
              'login'
                ? 'Entre para acessar seu perfil, carteira, favoritos e atividades.'
                : 'Cadastre-se para salvar sua coleção, acompanhar compras e acessar seu perfil.'}
            </p>
          </div>

          {mode ===
            'register' && (
            <label className="block">
              <span
                className="
                  mb-2 block
                  text-[13px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Nome de usuário
              </span>

              <input
                type="text"
                value={
                  username
                }
                onChange={(
                  event,
                ) =>
                  setUsername(
                    event.target
                      .value,
                  )
                }
                autoComplete="username"
                required
                disabled={
                  isSubmitting
                }
                className="
                  h-[44px] w-full
                  rounded-[6px]
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-ink)]
                  px-3
                  text-[14px]
                  text-[var(--color-foreground-kurio)]
                  outline-none
                  transition-colors
                  placeholder:text-[var(--color-text-secondary)]
                  focus:border-[var(--color-primary-kurio)]
                "
                placeholder="Seu nome de usuário"
              />
            </label>
          )}

          <label className="block">
            <span
              className="
                mb-2 block
                text-[13px]
                text-[var(--color-foreground-kurio)]
              "
            >
              E-mail
            </span>

            <input
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              autoComplete="email"
              required
              disabled={
                isSubmitting
              }
              className="
                h-[44px] w-full
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-ink)]
                px-3
                text-[14px]
                text-[var(--color-foreground-kurio)]
                outline-none
                transition-colors
                placeholder:text-[var(--color-text-secondary)]
                focus:border-[var(--color-primary-kurio)]
              "
              placeholder="voce@email.com"
            />
          </label>

          <label className="block">
            <span
              className="
                mb-2 block
                text-[13px]
                text-[var(--color-foreground-kurio)]
              "
            >
              Senha
            </span>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  password
                }
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                autoComplete={
                  mode ===
                  'login'
                    ? 'current-password'
                    : 'new-password'
                }
                required
                disabled={
                  isSubmitting
                }
                className="
                  h-[44px] w-full
                  rounded-[6px]
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-ink)]
                  px-3 pr-11
                  text-[14px]
                  text-[var(--color-foreground-kurio)]
                  outline-none
                  transition-colors
                  placeholder:text-[var(--color-text-secondary)]
                  focus:border-[var(--color-primary-kurio)]
                "
                placeholder="Sua senha"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                aria-label={
                  showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
                className="
                  absolute
                  right-3 top-1/2
                  -translate-y-1/2
                  text-[var(--color-text-secondary)]
                "
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}
              </button>
            </div>
          </label>

          {mode ===
            'register' && (
            <label className="block">
              <span
                className="
                  mb-2 block
                  text-[13px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Confirmar senha
              </span>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event,
                  ) =>
                    setConfirmPassword(
                      event.target
                        .value,
                    )
                  }
                  autoComplete="new-password"
                  required
                  disabled={
                    isSubmitting
                  }
                  className="
                    h-[44px] w-full
                    rounded-[6px]
                    border
                    border-[var(--color-border-kurio)]
                    bg-[var(--color-ink)]
                    px-3 pr-11
                    text-[14px]
                    text-[var(--color-foreground-kurio)]
                    outline-none
                    transition-colors
                    placeholder:text-[var(--color-text-secondary)]
                    focus:border-[var(--color-primary-kurio)]
                  "
                  placeholder="Repita sua senha"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                  className="
                    absolute
                    right-3 top-1/2
                    -translate-y-1/2
                    text-[var(--color-text-secondary)]
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>
            </label>
          )}

          {mode ===
            'login' && (
            <div className="text-right">
              <button
                type="button"
                className="
                  text-[12px]
                  text-[var(--color-text-accent)]
                "
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="
                rounded-[6px]
                border
                border-red-900/60
                bg-red-950/30
                px-3 py-2
                text-[12px]
                leading-5
                text-red-300
              "
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="
              flex h-[44px]
              w-full
              items-center
              justify-center
              rounded-[6px]
              bg-[var(--color-primary-kurio)]
              text-[15px]
              font-semibold
              text-[var(--color-ink)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting
              ? 'Aguarde...'
              : mode ===
                  'login'
                ? 'Entrar'
                : 'Criar conta'}
          </button>

          <div
            className="
              flex items-center gap-3
              py-1
            "
          >
            <span
              className="
                h-px flex-1
                bg-[var(--color-border-kurio)]
              "
            />

            <span
              className="
                text-[11px]
                uppercase
                text-[var(--color-text-secondary)]
              "
            >
              ou
            </span>

            <span
              className="
                h-px flex-1
                bg-[var(--color-border-kurio)]
              "
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="
                h-[42px]
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-ink)]
                text-[13px]
                text-[var(--color-foreground-kurio)]
              "
            >
              Google
            </button>

            <button
              type="button"
              className="
                h-[42px]
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-ink)]
                text-[13px]
                text-[var(--color-foreground-kurio)]
              "
            >
              Facebook
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}