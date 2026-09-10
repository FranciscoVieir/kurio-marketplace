import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import axios from 'axios'
import {
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  useDeleteWallet,
  useSaveWallet,
  useWallets,
} from '@/features/wallets/hooks/use-wallets'

import type {
  SaveWalletRequest,
  UserWallet,
  WalletProvider,
  WalletRole,
} from '@/features/wallets/types/wallet'

import type {
  NftNetwork,
} from '@/features/nft/types/nft'

type WalletFormState = {
  displayName: string
  nickname: string
  network: NftNetwork | ''
  profileName: string
  address: string
  secondaryAddress: string
  provider: WalletProvider | ''
  referralCode: string
  email: string
  ensName: string
}

const emptyWalletForm: WalletFormState = {
  displayName: '',
  nickname: '',
  network: '',
  profileName: '',
  address: '',
  secondaryAddress: '',
  provider: '',
  referralCode: '',
  email: '',
  ensName: '',
}

function walletToForm(
  wallet: UserWallet,
): WalletFormState {
  return {
    displayName:
      wallet.displayName,

    nickname:
      wallet.nickname,

    network:
      wallet.network,

    profileName:
      wallet.profileName,

    address:
      wallet.address,

    secondaryAddress:
      wallet.secondaryAddress ??
      '',

    provider:
      wallet.provider,

    referralCode:
      wallet.referralCode ??
      '',

    email:
      wallet.email,

    ensName:
      wallet.ensName ??
      '',
  }
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

  return 'Não foi possível salvar a carteira.'
}

type WalletFormProps = {
  role: WalletRole
  wallet?: UserWallet
  form: WalletFormState
  onChange: (
    form: WalletFormState,
  ) => void
  onSaved?: () => void
}

function WalletForm({
  role,
  wallet,
  form,
  onChange,
  onSaved,
}: WalletFormProps) {
  const saveWallet =
    useSaveWallet()

  const deleteWallet =
    useDeleteWallet()

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  )

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  )

  function updateField<
    Key extends keyof WalletFormState,
  >(
    key: Key,
    value: WalletFormState[Key],
  ) {
    onChange({
      ...form,
      [key]: value,
    })
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage(
      null,
    )

    setSuccessMessage(
      null,
    )

    if (
      !form.displayName.trim() ||
      !form.nickname.trim() ||
      !form.network ||
      !form.profileName.trim() ||
      !form.address.trim() ||
      !form.provider ||
      !form.email.trim()
    ) {
      setErrorMessage(
        'Preencha todos os campos obrigatórios.',
      )

      return
    }

    const input: SaveWalletRequest = {
      role,

      displayName:
        form.displayName.trim(),

      nickname:
        form.nickname.trim(),

      network:
        form.network,

      profileName:
        form.profileName.trim(),

      address:
        form.address.trim(),

      secondaryAddress:
        form.secondaryAddress.trim() ||
        undefined,

      provider:
        form.provider,

      referralCode:
        form.referralCode.trim() ||
        undefined,

      email:
        form.email.trim(),

      ensName:
        form.ensName.trim() ||
        undefined,
    }

    try {
      await saveWallet.mutateAsync({
        walletId:
          wallet?.id,

        input,
      })

      setSuccessMessage(
        'Carteira salva com sucesso.',
      )

      onSaved?.()
    } catch (
      error
    ) {
      setErrorMessage(
        getErrorMessage(
          error,
        ),
      )
    }
  }

  async function handleDelete() {
    if (!wallet) {
      return
    }

    setErrorMessage(
      null,
    )

    try {
      await deleteWallet.mutateAsync(
        wallet.id,
      )

      onChange({
        ...emptyWalletForm,
      })

      onSaved?.()
    } catch (
      error
    ) {
      setErrorMessage(
        getErrorMessage(
          error,
        ),
      )
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="mt-5"
    >
      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
        <Field
          label="Nome de exibição"
          required
        >
          <input
            value={
              form.displayName
            }
            onChange={(
              event,
            ) => {
              updateField(
                'displayName',
                event.target.value,
              )
            }}
            className={inputClassName}
          />
        </Field>

        <Field
          label="Apelido da carteira"
          required
        >
          <input
            value={
              form.nickname
            }
            onChange={(
              event,
            ) => {
              updateField(
                'nickname',
                event.target.value,
              )
            }}
            className={inputClassName}
          />
        </Field>

        <Field
          label="Rede"
          required
        >
          <select
            value={
              form.network
            }
            onChange={(
              event,
            ) => {
              updateField(
                'network',
                event.target
                  .value as
                  | NftNetwork
                  | '',
              )
            }}
            className={inputClassName}
          >
            <option value="">
              Selecione uma rede
            </option>

            <option value="ethereum">
              Ethereum
            </option>

            <option value="polygon">
              Polygon
            </option>

            <option value="solana">
              Solana
            </option>
          </select>
        </Field>

        <Field
          label="Nome do perfil"
          required
        >
          <input
            value={
              form.profileName
            }
            onChange={(
              event,
            ) => {
              updateField(
                'profileName',
                event.target.value,
              )
            }}
            className={inputClassName}
          />
        </Field>

        <Field
          label="Endereço da carteira"
          required
        >
          <input
            value={
              form.address
            }
            onChange={(
              event,
            ) => {
              updateField(
                'address',
                event.target.value,
              )
            }}
            placeholder="Endereço 0x da carteira"
            className={inputClassName}
          />
        </Field>

        <Field label="Carteira / ENS secundária">
          <input
            value={
              form.secondaryAddress
            }
            onChange={(
              event,
            ) => {
              updateField(
                'secondaryAddress',
                event.target.value,
              )
            }}
            placeholder="ENS ou carteira secundária (opcional)"
            className={inputClassName}
          />
        </Field>

        <Field
          label="Tipo de carteira"
          required
        >
          <select
            value={
              form.provider
            }
            onChange={(
              event,
            ) => {
              updateField(
                'provider',
                event.target
                  .value as
                  | WalletProvider
                  | '',
              )
            }}
            className={inputClassName}
          >
            <option value="">
              Selecione uma carteira
            </option>

            <option value="metamask">
              MetaMask
            </option>

            <option value="coinbase">
              Coinbase Wallet
            </option>

            <option value="walletconnect">
              WalletConnect
            </option>

            <option value="other">
              Outra
            </option>
          </select>
        </Field>

        <Field label="Código de indicação">
          <input
            value={
              form.referralCode
            }
            onChange={(
              event,
            ) => {
              updateField(
                'referralCode',
                event.target.value,
              )
            }}
            className={inputClassName}
          />
        </Field>

        <Field
          label="E-mail"
          required
        >
          <input
            type="email"
            value={
              form.email
            }
            onChange={(
              event,
            ) => {
              updateField(
                'email',
                event.target.value,
              )
            }}
            className={inputClassName}
          />
        </Field>

        <Field label="Nome ENS">
          <div className="flex">
            <div
              className="
                flex
                h-10
                items-center
                border
                border-r-0
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                px-3
                text-xs
                text-[var(--color-text-secondary)]
              "
            >
              .eth
            </div>

            <input
              value={
                form.ensName
              }
              onChange={(
                event,
              ) => {
                updateField(
                  'ensName',
                  event.target.value,
                )
              }}
              className={`${inputClassName} flex-1`}
            />
          </div>
        </Field>
      </div>

      {errorMessage && (
        <p className="mt-4 text-xs text-red-400">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-accent)]">
          <CheckCircle2
            size={14}
          />

          {successMessage}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={
            saveWallet.isPending
          }
          className="
            rounded-[var(--radius-control)]
            bg-[var(--color-primary-kurio)]
            px-4
            py-2
            text-xs
            font-semibold
            text-[var(--color-ink)]
            disabled:opacity-50
          "
        >
          {saveWallet.isPending
            ? 'Salvando...'
            : 'Salvar carteira'}
        </button>

        {wallet && (
          <button
            type="button"
            disabled={
              deleteWallet.isPending
            }
            onClick={() => {
              void handleDelete()
            }}
            className="
              flex
              items-center
              gap-2
              px-2
              py-2
              text-xs
              text-[var(--color-text-secondary)]
              transition
              hover:text-red-400
              disabled:opacity-50
            "
          >
            <Trash2
              size={14}
            />

            Remover
          </button>
        )}
      </div>
    </form>
  )
}

type FieldProps = {
  label: string
  required?: boolean
  children: React.ReactNode
}

function Field({
  label,
  required,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] text-[var(--color-foreground-kurio)]">
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

const inputClassName = `
  h-10
  w-full
  border
  border-[var(--color-border-kurio)]
  bg-transparent
  px-3
  text-xs
  text-[var(--color-foreground-kurio)]
  outline-none
  transition
  placeholder:text-[var(--color-text-secondary)]/60
  focus:border-[var(--color-primary-kurio)]
`

export function ProfileWalletsPage() {
  const {
    data: wallets = [],
    isLoading,
    isError,
  } = useWallets()

  const primaryWallet =
    useMemo(
      () =>
        wallets.find(
          (wallet) =>
            wallet.role ===
            'primary',
        ),
      [
        wallets,
      ],
    )

  const secondaryWallet =
    useMemo(
      () =>
        wallets.find(
          (wallet) =>
            wallet.role ===
            'secondary',
        ),
      [
        wallets,
      ],
    )

  const [
    primaryForm,
    setPrimaryForm,
  ] =
    useState<WalletFormState>({
      ...emptyWalletForm,
    })

  const [
    secondaryForm,
    setSecondaryForm,
  ] =
    useState<WalletFormState>({
      ...emptyWalletForm,
    })

  const [
    showSecondary,
    setShowSecondary,
  ] = useState(false)

  useEffect(() => {
    if (primaryWallet) {
      setPrimaryForm(
        walletToForm(
          primaryWallet,
        ),
      )
    }
  }, [
    primaryWallet,
  ])

  useEffect(() => {
    if (secondaryWallet) {
      setSecondaryForm(
        walletToForm(
          secondaryWallet,
        ),
      )

      setShowSecondary(
        true,
      )
    }
  }, [
    secondaryWallet,
  ])

  if (isLoading) {
    return (
      <p className="text-xs text-[var(--color-text-secondary)]">
        Carregando carteiras...
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Não foi possível carregar suas carteiras.
      </p>
    )
  }

  return (
    <section className="max-w-[900px]">
      <div>
        <div className="flex items-start justify-between gap-5">
          <div>
            <h1 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
              Carteira principal
            </h1>

            <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
          </div>

          {!primaryWallet && (
            <span className="text-[11px] text-[var(--color-text-accent)]">
              Adicionar
            </span>
          )}
        </div>

        <WalletForm
          role="primary"
          wallet={
            primaryWallet
          }
          form={
            primaryForm
          }
          onChange={
            setPrimaryForm
          }
        />
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
              Carteira secundária
            </h2>

            {!secondaryWallet &&
              !showSecondary && (
                <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                  Você ainda não adicionou uma carteira secundária.
                </p>
              )}
          </div>

          {!secondaryWallet &&
            !showSecondary && (
              <button
                type="button"
                onClick={() => {
                  setShowSecondary(
                    true,
                  )
                }}
                className="
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-[var(--color-text-accent)]
                "
              >
                <Plus
                  size={13}
                />

                Adicionar
              </button>
            )}
        </div>

        {showSecondary && (
          <WalletForm
            role="secondary"
            wallet={
              secondaryWallet
            }
            form={
              secondaryForm
            }
            onChange={
              setSecondaryForm
            }
            onSaved={() => {
              if (
                !secondaryWallet
              ) {
                setShowSecondary(
                  true,
                )
              }
            }}
          />
        )}
      </div>
    </section>
  )
}