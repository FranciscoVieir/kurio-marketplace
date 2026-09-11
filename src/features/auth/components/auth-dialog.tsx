import {
  useEffect,
  useRef,
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

type AuthFieldErrors = {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

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

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[16px] w-[16px] shrink-0"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.232c1.891-1.741 2.981-4.309 2.981-7.351Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.619-2.423l-3.232-2.509c-.895.6-2.04.954-3.387.954-2.605 0-4.81-1.759-5.596-4.123H3.064v2.591A9.999 9.999 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.404 13.899A6.02 6.02 0 0 1 6.09 12c0-.659.114-1.3.314-1.899V7.51H3.064A9.999 9.999 0 0 0 2 12c0 1.614.386 3.141 1.064 4.49l3.34-2.591Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.959 2.991 14.695 2 12 2a9.999 9.999 0 0 0-8.936 5.51l3.34 2.591C7.19 7.737 9.395 5.977 12 5.977Z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[16px] w-[16px] shrink-0"
    >
      <path
        fill="#1877F2"
        d="M13.53 22v-8.2h2.75l.41-3.2h-3.16V8.56c0-.93.26-1.56 1.6-1.56h1.7V4.14c-.29-.04-1.3-.13-2.48-.13-2.46 0-4.15 1.5-4.15 4.27v2.32H7.42v3.2h2.78V22h3.33Z"
      />
    </svg>
  )
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

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<AuthFieldErrors>(
      {},
    )

  const dialogRef =
    useRef<HTMLElement | null>(
      null,
    )

  const usernameInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const emailInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const passwordInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const confirmPasswordInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const previousActiveElementRef =
    useRef<HTMLElement | null>(
      null,
    )

  const onCloseRef =
    useRef(
      onClose,
    )

  useEffect(() => {
    onCloseRef.current =
      onClose
  }, [
    onClose,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    setErrorMessage(
      null,
    )

    setFieldErrors(
      {},
    )

    const focusFrame =
      window.requestAnimationFrame(
        () => {
          emailInputRef.current?.focus()
        },
      )

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        event.preventDefault()

        onCloseRef.current()

        return
      }

      if (
        event.key !==
        'Tab'
      ) {
        return
      }

      const dialog =
        dialogRef.current

      if (!dialog) {
        return
      }

      const focusableElements =
        Array.from(
          dialog.querySelectorAll<HTMLElement>(
            focusableSelector,
          ),
        ).filter(
          (element) =>
            element.getClientRects()
              .length > 0,
        )

      if (
        focusableElements.length ===
        0
      ) {
        event.preventDefault()

        return
      }

      const firstElement =
        focusableElements[0]

      const lastElement =
        focusableElements[
          focusableElements.length -
            1
        ]

      const activeElement =
        document.activeElement

      if (
        event.shiftKey &&
        (
          activeElement ===
            firstElement ||
          !dialog.contains(
            activeElement,
          )
        )
      ) {
        event.preventDefault()

        lastElement.focus()

        return
      }

      if (
        !event.shiftKey &&
        activeElement ===
          lastElement
      ) {
        event.preventDefault()

        firstElement.focus()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.cancelAnimationFrame(
        focusFrame,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      const previousElement =
        previousActiveElementRef.current

      if (
        previousElement?.isConnected
      ) {
        window.requestAnimationFrame(
          () => {
            previousElement.focus()
          },
        )
      }
    }
  }, [
    open,
  ])

  useEffect(() => {
    setErrorMessage(
      null,
    )

    setFieldErrors(
      {},
    )

    if (!open) {
      return
    }

    const focusFrame =
      window.requestAnimationFrame(
        () => {
          if (
            mode ===
            'register'
          ) {
            usernameInputRef.current?.focus()

            return
          }

          emailInputRef.current?.focus()
        },
      )

    return () => {
      window.cancelAnimationFrame(
        focusFrame,
      )
    }
  }, [
    mode,
    open,
  ])


  if (!open) {
    return null
  }

  function clearFieldError(
    field: keyof AuthFieldErrors,
  ) {
    setFieldErrors(
      (currentErrors) => {
        if (
          !currentErrors[
            field
          ]
        ) {
          return currentErrors
        }

        return {
          ...currentErrors,
          [field]:
            undefined,
        }
      },
    )
  }

  function validateForm() {
    const errors: AuthFieldErrors =
      {}

    if (
      mode ===
        'register' &&
      !username.trim()
    ) {
      errors.username =
        'Informe o nome de usuário.'
    }

    const normalizedEmail =
      email.trim()

    if (!normalizedEmail) {
      errors.email =
        'Informe seu e-mail.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      errors.email =
        'Informe um e-mail válido.'
    }

    if (!password) {
      errors.password =
        'Informe sua senha.'
    } else if (
      mode ===
        'register' &&
      password.length < 6
    ) {
      errors.password =
        'A senha precisa ter pelo menos 6 caracteres.'
    }

    if (
      mode ===
      'register'
    ) {
      if (
        !confirmPassword
      ) {
        errors.confirmPassword =
          'Confirme sua senha.'
      } else if (
        password &&
        password !==
          confirmPassword
      ) {
        errors.confirmPassword =
          'A confirmação de senha não corresponde.'
      }
    }

    return errors
  }

  function focusFirstInvalidField(
    errors: AuthFieldErrors,
  ) {
    if (
      errors.username
    ) {
      usernameInputRef.current?.focus()

      return
    }

    if (errors.email) {
      emailInputRef.current?.focus()

      return
    }

    if (
      errors.password
    ) {
      passwordInputRef.current?.focus()

      return
    }

    if (
      errors.confirmPassword
    ) {
      confirmPasswordInputRef.current?.focus()
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage(
      null,
    )

    const validationErrors =
      validateForm()

    setFieldErrors(
      validationErrors,
    )

    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      focusFirstInvalidField(
        validationErrors,
      )

      return
    }

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

        max-md:block
        max-md:bg-[var(--color-surface-card)]
        max-md:p-0
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
        ref={
          dialogRef
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="
          relative
          min-h-[624px]
          w-full max-w-[520px]
          overflow-hidden
          border-0
          bg-[var(--color-surface-card)]
          px-[50px] pb-[72px] pt-[44px]
          shadow-2xl

          max-md:h-[100dvh]
          max-md:max-h-none
          max-md:max-w-none
          max-md:overflow-y-auto
          max-md:rounded-none
          max-md:border-0
          max-md:px-[16px]
          max-md:pb-[28px]
          max-md:pt-0
          max-md:shadow-none
        "
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="
            absolute right-[16px] top-[14px]
            text-[var(--color-text-accent)]
            transition-colors
            hover:text-[var(--color-foreground-kurio)]

            max-md:hidden
          "
        >
          <X
            size={20}
            strokeWidth={1.8}
          />
        </button>

        <div
          className="
            mb-[36px]
            flex
            items-center
            justify-center
            gap-[10px]

            max-md:hidden
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
              text-[20px]
              font-semibold
              leading-[24px]
              transition-colors
              ${
                mode ===
                'login'
                  ? 'text-[var(--color-text-accent)]'
                  : 'text-[var(--color-foreground-kurio)]'
              }
            `}
          >
            Entrar
          </button>

          <span
            aria-hidden="true"
            className="
              text-[18px]
              leading-[24px]
              text-[var(--color-text-secondary)]
            "
          >
            |
          </span>

          <button
            type="button"
            onClick={() =>
              setMode(
                'register',
              )
            }
            className={`
              text-[20px]
              font-semibold
              leading-[24px]
              transition-colors
              ${
                mode ===
                'register'
                  ? 'text-[var(--color-text-accent)]'
                  : 'text-[var(--color-foreground-kurio)]'
              }
            `}
          >
            Criar conta
          </button>
        </div>

        <div
          className="
            hidden

            max-md:mx-auto
            max-md:flex
            max-md:h-[160px]
            max-md:w-full
            max-md:max-w-[358px]
            max-md:items-center
            max-md:justify-center
          "
        >
          <span
            className="
              text-center
              text-[32px]
              font-bold
              leading-none
              tracking-[0.1em]
              text-[var(--color-foreground-kurio)]
            "
          >
            KURIO
          </span>
        </div>

        <form
          noValidate
          onSubmit={
            handleSubmit
          }
          className="
            mx-auto
            w-full
            max-w-[352px]
            space-y-[14px]

            max-md:max-w-[358px]
            max-md:space-y-[10px]
          "
        >
          <div>
            <h2
              id="auth-dialog-title"
              className="
                sr-only

                max-md:not-sr-only
                max-md:mb-[10px]
                max-md:text-center
                max-md:text-[18px]
                max-md:font-bold
                max-md:leading-[18px]
                max-md:text-[var(--color-foreground-kurio)]
              "
            >
              <span className="max-md:hidden">
                {mode ===
                'login'
                  ? 'Bem-vindo de volta'
                  : 'Crie sua conta'}
              </span>

              <span className="hidden max-md:inline">
                {mode ===
                'login'
                  ? 'Entrar'
                  : 'Criar perfil de colecionador'}
              </span>
            </h2>

            <p
              className="
                mb-[10px]
                text-center
                text-[13px]
                leading-[17px]
                text-[var(--color-foreground-kurio)]

                max-md:hidden
              "
            >
              {mode === 'login'
                ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
                : 'Crie sua conta para gerenciar sua carteira, coleção e perfil de criador.'}
            </p>
          </div>

          {mode ===
            'register' && (
            <label className="block">
              <span
                className="sr-only"
              >
                Nome de usuário
              </span>

              <div className="relative">
                <input
                  ref={
                    usernameInputRef
                  }
                  id="auth-username"
                  type="text"
                  value={
                    username
                  }
                  onChange={(
                    event,
                  ) => {
                    setUsername(
                      event.target
                        .value,
                    )

                    clearFieldError(
                      'username',
                    )
                  }}
                  autoComplete="username"
                  required
                  aria-invalid={
                    Boolean(
                      fieldErrors.username,
                    )
                  }
                  aria-describedby={
                    fieldErrors.username
                      ? 'auth-username-error'
                      : errorMessage
                        ? 'auth-form-error'
                        : undefined
                  }
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

                    max-md:h-[50px]
                    max-md:rounded-[10px]
                    max-md:px-[16px]
                    max-md:text-[14px]
                    max-md:leading-[16px]
                    max-md:placeholder:text-transparent
                  "
                  placeholder="Nome de usuário"
                />

                {!username && (
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      left-[16px]
                      top-1/2
                      hidden
                      -translate-y-1/2
                      text-[14px]
                      leading-[16px]
                      text-[var(--color-text-secondary)]

                      max-md:block
                    "
                  >
                    Nome de usuário
                  </span>
                )}
              </div>

              {fieldErrors.username && (
                <span
                  id="auth-username-error"
                  role="alert"
                  className="mt-1 block text-[11px] leading-4 text-red-300"
                >
                  {
                    fieldErrors.username
                  }
                </span>
              )}
            </label>
          )}

          <label className="block">
            <span
              className="sr-only"
            >
              E-mail
            </span>

            <div className="relative">
              <input
                ref={
                  emailInputRef
                }
                id="auth-email"
                type="email"
                value={email}
                onChange={(
                  event,
                ) => {
                  setEmail(
                    event.target
                      .value,
                  )

                  clearFieldError(
                    'email',
                  )
                }}
                autoComplete="email"
                required
                aria-invalid={
                  Boolean(
                    fieldErrors.email ||
                      errorMessage,
                  )
                }
                aria-describedby={
                  fieldErrors.email
                    ? 'auth-email-error'
                    : errorMessage
                      ? 'auth-form-error'
                      : undefined
                }
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

                  max-md:h-[50px]
                  max-md:rounded-[10px]
                  max-md:px-[16px]
                  max-md:text-[14px]
                  max-md:leading-[16px]
                  max-md:placeholder:text-transparent
                "
                placeholder={
                  mode === 'login'
                    ? 'contato@email.com'
                    : 'Digite seu e-mail'
                }
              />

              {!email && (
                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    left-[16px]
                    top-1/2
                    hidden
                    -translate-y-1/2
                    text-[14px]
                    leading-[16px]
                    text-[var(--color-text-secondary)]

                    max-md:block
                  "
                >
                  {mode === 'login'
                    ? 'contato@email.com'
                    : 'Digite seu e-mail'}
                </span>
              )}
            </div>

            {fieldErrors.email && (
              <span
                id="auth-email-error"
                role="alert"
                className="mt-1 block text-[11px] leading-4 text-red-300"
              >
                {
                  fieldErrors.email
                }
              </span>
            )}
          </label>

          <label className="block">
            <span
              className="sr-only"
            >
              Senha
            </span>

            <div className="relative">
              <input
                ref={
                  passwordInputRef
                }
                id="auth-password"
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
                ) => {
                  setPassword(
                    event.target
                      .value,
                  )

                  clearFieldError(
                    'password',
                  )
                }}
                autoComplete={
                  mode ===
                  'login'
                    ? 'current-password'
                    : 'new-password'
                }
                required
                aria-invalid={
                  Boolean(
                    fieldErrors.password ||
                      errorMessage,
                  )
                }
                aria-describedby={
                  fieldErrors.password
                    ? 'auth-password-error'
                    : errorMessage
                      ? 'auth-form-error'
                      : undefined
                }
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

                  max-md:h-[50px]
                  max-md:rounded-[10px]
                  max-md:pl-[16px]
                  max-md:pr-[48px]
                  max-md:text-[14px]
                  max-md:leading-[16px]
                  max-md:placeholder:text-transparent
                "
                placeholder="Senha"
              />

              {!password && (
                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    left-[16px]
                    top-1/2
                    hidden
                    -translate-y-1/2
                    text-[14px]
                    leading-[16px]
                    text-[var(--color-text-secondary)]

                    max-md:block
                  "
                >
                  Senha
                </span>
              )}

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

                  max-md:right-[14px]
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

            {fieldErrors.password && (
              <span
                id="auth-password-error"
                role="alert"
                className="mt-1 block text-[11px] leading-4 text-red-300"
              >
                {
                  fieldErrors.password
                }
              </span>
            )}
          </label>

          {mode ===
            'register' && (
            <label className="block">
              <span
                className="sr-only"
              >
                Confirmar senha
              </span>

              <div className="relative">
                <input
                  ref={
                    confirmPasswordInputRef
                  }
                  id="auth-confirm-password"
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
                  ) => {
                    setConfirmPassword(
                      event.target
                        .value,
                    )

                    clearFieldError(
                      'confirmPassword',
                    )
                  }}
                  autoComplete="new-password"
                  required
                  aria-invalid={
                    Boolean(
                      fieldErrors.confirmPassword ||
                        errorMessage,
                    )
                  }
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? 'auth-confirm-password-error'
                      : errorMessage
                        ? 'auth-form-error'
                        : undefined
                  }
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

                    max-md:h-[50px]
                    max-md:rounded-[10px]
                    max-md:pl-[16px]
                    max-md:pr-[48px]
                    max-md:text-[14px]
                    max-md:leading-[16px]
                    max-md:placeholder:text-transparent
                  "
                  placeholder="Confirmar senha"
                />

                {!confirmPassword && (
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      left-[16px]
                      top-1/2
                      hidden
                      -translate-y-1/2
                      text-[14px]
                      leading-[16px]
                      text-[var(--color-text-secondary)]

                      max-md:block
                    "
                  >
                    Confirmar senha
                  </span>
                )}

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

                    max-md:right-[14px]
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

              {fieldErrors.confirmPassword && (
                <span
                  id="auth-confirm-password-error"
                  role="alert"
                  className="mt-1 block text-[11px] leading-4 text-red-300"
                >
                  {
                    fieldErrors.confirmPassword
                  }
                </span>
              )}
            </label>
          )}

          {mode ===
            'login' && (
            <div
              className="
                text-right

                max-md:h-[16px]
              "
            >
              <button
                type="button"
                className="
                  text-[12px]
                  text-[var(--color-text-accent)]

                  max-md:text-[12px]
                  max-md:leading-[16px]
                "
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {errorMessage && (
            <div
              id="auth-form-error"
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

                max-md:rounded-[10px]
                max-md:px-[14px]
                max-md:py-[10px]
                max-md:text-[12px]
                max-md:leading-[18px]
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
              flex h-[48px]
              w-full
              items-center
              justify-center
              rounded-[6px]
              bg-[var(--color-primary-kurio)]
              text-[16px]
              font-bold
              text-[var(--color-ink)]
              disabled:cursor-not-allowed
              disabled:opacity-60

              max-md:h-[52px]
              max-md:rounded-[10px]
              max-md:text-[15px]
              max-md:font-bold
              max-md:leading-[16px]
            "
          >
            {isSubmitting
              ? 'Aguarde...'
              : mode ===
                  'login'
                ? 'Entrar'
                : (
                    <>
                      <span className="max-md:hidden">
                        Criar conta
                      </span>

                      <span className="hidden max-md:inline">
                        Criar perfil
                      </span>
                    </>
                  )}
          </button>

          <div
            className="
              flex items-center gap-3
              py-1

              max-md:h-[16px]
              max-md:py-0
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
                text-[13px]
                font-normal
                leading-[16px]
                text-[var(--color-foreground-kurio)]

                max-md:text-[12px]
                max-md:text-[var(--color-text-secondary)]
              "
            >
              Ou continue com
            </span>

            <span
              className="
                h-px flex-1
                bg-[var(--color-border-kurio)]
              "
            />
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-[12px]
            "
          >
            <button
              type="button"
              className="
                flex
                h-[42px]
                w-full
                items-center
                justify-center
                gap-[12px]
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-ink)]
                text-[13px]
                font-medium
                leading-[16px]
                text-[var(--color-text-secondary)]

                max-md:h-[40px]
                max-md:gap-[10px]
                max-md:text-[12px]
              "
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <button
              type="button"
              className="
                flex
                h-[42px]
                w-full
                items-center
                justify-center
                gap-[12px]
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-ink)]
                text-[13px]
                font-medium
                leading-[16px]
                text-[var(--color-text-secondary)]

                max-md:h-[40px]
                max-md:gap-[10px]
                max-md:text-[12px]
              "
            >
              <FacebookIcon />
              Continuar com Facebook
            </button>
          </div>

          <div
            className="
              hidden

              max-md:flex
              max-md:h-[20px]
              max-md:items-center
              max-md:justify-center
              max-md:pt-[8px]
            "
          >
            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === 'login'
                    ? 'register'
                    : 'login',
                )
              }}
              className="
                text-center
                text-[14px]
                font-normal
                leading-[16px]
                text-[var(--color-text-secondary)]
              "
            >
              {mode === 'login' ? (
                <>
                  Novo na Kurio?{' '}
                  <span className="text-[var(--color-text-accent)]">
                    Crie uma conta
                  </span>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <span className="text-[var(--color-text-accent)]">
                    Entre
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        <div
          aria-hidden="true"
          className="
            absolute
            bottom-0
            left-0
            h-[10px]
            w-full
            bg-[var(--color-primary-kurio)]

            max-md:hidden
          "
        />
      </section>
    </div>
  )
}