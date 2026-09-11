import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import axios from 'axios'

import { Input } from '@/components/ui/input'

import {
  Eye,
  EyeOff,
  UserRound,
} from 'lucide-react'

import {
  useAuth,
} from '@/features/auth/hooks/use-auth'

import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from '@/features/profile/hooks/use-profile'

import type {
  UpdateCollectorProfileRequest,
} from '@/features/profile/types/profile'

type ProfileFormState = {
  displayName: string
  username: string
  email: string
  ensName: string
  walletNickname: string
  avatar: string
}

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const emptyProfileForm: ProfileFormState = {
  displayName: '',
  username: '',
  email: '',
  ensName: '',
  walletNickname: '',
  avatar: '',
}

const emptyPasswordForm: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

function getErrorMessage(
  error: unknown,
) {
  if (
    axios.isAxiosError(
      error,
    )
  ) {
    const data =
      error.response
        ?.data as
        | {
            message?: string
          }
        | undefined

    if (
      data?.message
    ) {
      return data.message
    }
  }

  return 'Não foi possível concluir a operação.'
}

function getInitials(
  name: string,
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (
    parts.length === 0
  ) {
    return 'U'
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toUpperCase()
}

const inputClassName = `
  h-10
  w-full
  rounded-md
  border-[var(--color-border-kurio)]
  bg-transparent
  px-3
  text-xs
  leading-5
  text-[var(--color-foreground-kurio)]
  shadow-none
  placeholder:text-[var(--color-text-secondary)]/60
  focus-visible:border-[var(--color-primary-kurio)]
  focus-visible:ring-[var(--color-primary-kurio)]/15
  disabled:cursor-not-allowed
  disabled:opacity-50
`

type FieldProps = {
  label: string
  required?: boolean
  children: React.ReactNode
}

function Field({
  label,
  required = false,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium leading-4 text-[var(--color-foreground-kurio)]">
        {label}

        {required && (
          <span className="ml-1 text-[var(--color-text-accent)]">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  )
}

type PasswordFieldProps = {
  label: string
  value: string
  visible: boolean
  onChange: (
    value: string,
  ) => void
  onToggleVisibility: () => void
}

function PasswordField({
  label,
  value,
  visible,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <Field
      label={label}
      required
    >
      <div className="relative">
        <Input
          type={
            visible
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={(
            event,
          ) => {
            onChange(
              event.target.value,
            )
          }}
          className={`${inputClassName} pr-10`}
        />

        <button
          type="button"
          aria-label={
            visible
              ? 'Ocultar senha'
              : 'Mostrar senha'
          }
          onClick={
            onToggleVisibility
          }
          className="
            absolute
            right-0
            top-0
            flex
            h-10
            w-10
            items-center
            justify-center
            text-[var(--color-text-secondary)]
            transition
            hover:text-[var(--color-foreground-kurio)]
          "
        >
          {visible ? (
            <EyeOff
              size={15}
            />
          ) : (
            <Eye
              size={15}
            />
          )}
        </button>
      </div>
    </Field>
  )
}

export function ProfilePage() {
  const {
    user,
    syncUser,
  } = useAuth()

  const {
    data: profile,
    isLoading,
    isError,
  } = useProfile()

  const updateProfile =
    useUpdateProfile()

  const changePassword =
    useChangePassword()

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const [
    profileForm,
    setProfileForm,
  ] =
    useState<ProfileFormState>(
      emptyProfileForm,
    )

  const [
    passwordForm,
    setPasswordForm,
  ] =
    useState<PasswordFormState>(
      emptyPasswordForm,
    )

  const [
    profileError,
    setProfileError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    profileSuccess,
    setProfileSuccess,
  ] =
    useState<string | null>(
      null,
    )

  const [
    passwordError,
    setPasswordError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] =
    useState<string | null>(
      null,
    )

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false)

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  useEffect(() => {
    if (!profile) {
      return
    }

    setProfileForm({
      displayName:
        profile.displayName,

      username:
        profile.username,

      email:
        profile.email,

      ensName:
        profile.ensName ??
        '',

      walletNickname:
        profile.walletNickname ??
        '',

      avatar:
        profile.avatar ??
        '',
    })
  }, [
    profile,
  ])

  function updateProfileField<
    Key extends keyof ProfileFormState,
  >(
    key: Key,
    value: ProfileFormState[Key],
  ) {
    setProfileForm(
      (currentForm) => ({
        ...currentForm,
        [key]: value,
      }),
    )
  }

  function updatePasswordField<
    Key extends keyof PasswordFormState,
  >(
    key: Key,
    value: PasswordFormState[Key],
  ) {
    setPasswordForm(
      (currentForm) => ({
        ...currentForm,
        [key]: value,
      }),
    )
  }

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setProfileError(
      null,
    )

    setProfileSuccess(
      null,
    )

    if (
      !profileForm.displayName.trim() ||
      !profileForm.username.trim() ||
      !profileForm.email.trim()
    ) {
      setProfileError(
        'Preencha os campos obrigatórios.',
      )

      return
    }

    const input: UpdateCollectorProfileRequest =
      {
        displayName:
          profileForm.displayName.trim(),

        username:
          profileForm.username.trim(),

        email:
          profileForm.email
            .trim()
            .toLowerCase(),

        ensName:
          profileForm.ensName.trim() ||
          undefined,

        walletNickname:
          profileForm.walletNickname.trim() ||
          undefined,

        avatar:
          profileForm.avatar ||
          undefined,
      }

    try {
      const updatedProfile =
        await updateProfile.mutateAsync(
          input,
        )

      /*
       * O endpoint de perfil também
       * atualiza os dados de identidade.
       *
       * Mantemos o AuthContext sincronizado
       * sem depender de F5.
       */
      if (user) {
        syncUser({
          ...user,

          displayName:
            updatedProfile.displayName,

          username:
            updatedProfile.username,

          email:
            updatedProfile.email,
        })
      }

      setProfileSuccess(
        'Perfil atualizado com sucesso.',
      )
    } catch (
      error
    ) {
      setProfileError(
        getErrorMessage(
          error,
        ),
      )
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setPasswordError(
      null,
    )

    setPasswordSuccess(
      null,
    )

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmNewPassword
    ) {
      setPasswordError(
        'Preencha todos os campos de senha.',
      )

      return
    }

    if (
      passwordForm.newPassword.length <
      6
    ) {
      setPasswordError(
        'A nova senha precisa ter pelo menos 6 caracteres.',
      )

      return
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmNewPassword
    ) {
      setPasswordError(
        'A confirmação da nova senha não corresponde.',
      )

      return
    }

    try {
      await changePassword.mutateAsync({
        currentPassword:
          passwordForm.currentPassword,

        newPassword:
          passwordForm.newPassword,

        confirmNewPassword:
          passwordForm.confirmNewPassword,
      })

      setPasswordForm(
        emptyPasswordForm,
      )

      setShowCurrentPassword(
        false,
      )

      setShowNewPassword(
        false,
      )

      setShowConfirmPassword(
        false,
      )

      setPasswordSuccess(
        'Senha alterada com sucesso.',
      )
    } catch (
      error
    ) {
      setPasswordError(
        getErrorMessage(
          error,
        ),
      )
    }
  }

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    setProfileError(
      null,
    )

    setProfileSuccess(
      null,
    )

    if (
      !file.type.startsWith(
        'image/',
      )
    ) {
      setProfileError(
        'Selecione um arquivo de imagem válido.',
      )

      event.target.value =
        ''

      return
    }

    const maxFileSize =
      1024 * 1024

    if (
      file.size >
      maxFileSize
    ) {
      setProfileError(
        'O avatar deve ter no máximo 1 MB.',
      )

      event.target.value =
        ''

      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      if (
        typeof reader.result !==
        'string'
      ) {
        return
      }

      updateProfileField(
        'avatar',
        reader.result,
      )
    }

    reader.onerror = () => {
      setProfileError(
        'Não foi possível carregar a imagem selecionada.',
      )
    }

    reader.readAsDataURL(
      file,
    )

    event.target.value =
      ''
  }

  function removeAvatar() {
    updateProfileField(
      'avatar',
      '',
    )

    setProfileError(
      null,
    )

    setProfileSuccess(
      null,
    )
  }

  if (isLoading) {
    return (
      <section
        aria-label="Carregando perfil"
        className="w-full max-w-225"
      >
        <div className="h-7 w-48 animate-pulse rounded-md bg-[var(--color-surface-card)]" />

        <div className="mt-7 grid gap-x-6 gap-y-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <div className="h-4 w-24 animate-pulse rounded-sm bg-[var(--color-surface-card)]" />
              <div className="h-10 animate-pulse rounded-md bg-[var(--color-surface-card)]" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (
    isError ||
    !profile
  ) {
    return (
      <p className="text-xs text-red-400">
        Não foi possível carregar seu perfil.
      </p>
    )
  }

  return (
    <section className="w-full max-w-225">
      <h1 className="text-xl font-semibold leading-7 text-[var(--color-foreground-kurio)]">
        Perfil do colecionador
      </h1>

      <form
        onSubmit={
          handleProfileSubmit
        }
        className="mt-6"
      >
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <Field
            label="Nome de exibição"
            required
          >
            <Input
              value={
                profileForm.displayName
              }
              onChange={(
                event,
              ) => {
                updateProfileField(
                  'displayName',
                  event.target.value,
                )
              }}
              className={
                inputClassName
              }
            />
          </Field>

          <Field
            label="Nome de usuário"
            required
          >
            <Input
              value={
                profileForm.username
              }
              onChange={(
                event,
              ) => {
                updateProfileField(
                  'username',
                  event.target.value,
                )
              }}
              className={
                inputClassName
              }
            />
          </Field>

          <Field
            label="E-mail"
            required
          >
            <input
              type="email"
              value={
                profileForm.email
              }
              onChange={(
                event,
              ) => {
                updateProfileField(
                  'email',
                  event.target.value,
                )
              }}
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Nome ENS">
            <div className="flex">
              <Input
                value={
                  profileForm.ensName
                }
                onChange={(
                  event,
                ) => {
                  updateProfileField(
                    'ensName',
                    event.target.value,
                  )
                }}
                autoComplete="off"
                placeholder="seunome"
                className={`${inputClassName} min-w-0 flex-1 rounded-r-none border-r-0`}
              />

              <div
                className="
                  flex
                  h-10
                  shrink-0
                  items-center
                  rounded-r-md
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  px-3
                  text-[11px]
                  font-medium
                  text-[var(--color-text-secondary)]
                "
              >
                .eth
              </div>
            </div>
          </Field>

          <Field label="Apelido da carteira">
            <Input
              value={
                profileForm.walletNickname
              }
              onChange={(
                event,
              ) => {
                updateProfileField(
                  'walletNickname',
                  event.target.value,
                )
              }}
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Avatar">
            <div className="flex min-h-14 items-center gap-4">
              <div
                className="
                  flex
                  size-14
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  text-xs
                  text-[var(--color-text-secondary)]
                "
              >
                {profileForm.avatar ? (
                  <img
                    src={
                      profileForm.avatar
                    }
                    alt="Avatar do perfil"
                    className="h-full w-full object-cover"
                  />
                ) : profileForm.displayName ? (
                  <span>
                    {getInitials(
                      profileForm.displayName,
                    )}
                  </span>
                ) : (
                  <UserRound
                    size={18}
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                  className="text-[11px] text-[var(--color-text-accent)] transition hover:opacity-70"
                >
                  Alterar
                </button>

                {profileForm.avatar && (
                  <button
                    type="button"
                    onClick={
                      removeAvatar
                    }
                    className="text-[11px] text-[var(--color-text-secondary)] transition hover:text-red-400"
                  >
                    Remover
                  </button>
                )}
              </div>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                onChange={
                  handleAvatarChange
                }
                className="hidden"
              />
            </div>
          </Field>
        </div>

        {profileError && (
          <p className="mt-4 text-xs text-red-400">
            {profileError}
          </p>
        )}

        {profileSuccess && (
          <p className="mt-4 text-xs text-[var(--color-text-accent)]">
            {profileSuccess}
          </p>
        )}

        <button
          type="submit"
          disabled={
            updateProfile.isPending
          }
          className="
            mt-5
            h-10
            rounded-md
            bg-[var(--color-primary-kurio)]
            px-5
            text-xs
            font-semibold
            text-[var(--color-ink)]
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {updateProfile.isPending
            ? 'Salvando...'
            : 'Salvar'}
        </button>
      </form>

      <div
        className="
          my-8
          h-px
          bg-[var(--color-border-kurio)]
        "
      />

      <section>
        <h2 className="text-base font-semibold leading-6 text-[var(--color-foreground-kurio)]">
          Alterar senha
        </h2>

        <form
          onSubmit={
            handlePasswordSubmit
          }
          className="mt-5 max-w-107.5"
        >
          <div className="space-y-4">
            <PasswordField
              label="Senha atual"
              value={
                passwordForm.currentPassword
              }
              visible={
                showCurrentPassword
              }
              onChange={(
                value,
              ) => {
                updatePasswordField(
                  'currentPassword',
                  value,
                )
              }}
              onToggleVisibility={() => {
                setShowCurrentPassword(
                  (visible) =>
                    !visible,
                )
              }}
            />

            <PasswordField
              label="Nova senha"
              value={
                passwordForm.newPassword
              }
              visible={
                showNewPassword
              }
              onChange={(
                value,
              ) => {
                updatePasswordField(
                  'newPassword',
                  value,
                )
              }}
              onToggleVisibility={() => {
                setShowNewPassword(
                  (visible) =>
                    !visible,
                )
              }}
            />

            <PasswordField
              label="Confirmar nova senha"
              value={
                passwordForm.confirmNewPassword
              }
              visible={
                showConfirmPassword
              }
              onChange={(
                value,
              ) => {
                updatePasswordField(
                  'confirmNewPassword',
                  value,
                )
              }}
              onToggleVisibility={() => {
                setShowConfirmPassword(
                  (visible) =>
                    !visible,
                )
              }}
            />
          </div>

          {passwordError && (
            <p className="mt-4 text-xs text-red-400">
              {passwordError}
            </p>
          )}

          {passwordSuccess && (
            <p className="mt-4 text-xs text-[var(--color-text-accent)]">
              {passwordSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={
              changePassword.isPending
            }
            className="
              mt-5
              h-10
              rounded-md
              bg-[var(--color-primary-kurio)]
              px-5
              text-xs
              font-semibold
              text-[var(--color-ink)]
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {changePassword.isPending
              ? 'Alterando...'
              : 'Alterar senha'}
          </button>
        </form>
      </section>
    </section>
  )
}