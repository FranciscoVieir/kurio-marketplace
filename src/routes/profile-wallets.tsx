import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
      className="
        mt-5

        max-md:mt-[20px]
      "
    >
      <div
        className="
          grid
          gap-x-6
          gap-y-4
          md:grid-cols-2

          max-md:gap-y-[16px]
        "
      >
        <Field
          label="Nome de exibição"
          required
        >
          <Input
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
            autoComplete="name"
            placeholder="Seu nome de exibição"
            className={inputClassName}
          />
        </Field>

        <Field
          label="Apelido da carteira"
          required
        >
          <Input
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
            placeholder="Ex.: Carteira principal"
            className={inputClassName}
          />
        </Field>

        <Field
          label="Rede"
          required
        >
          <Select
            value={
              form.network || null
            }
            onValueChange={(value) => {
              if (value === null) {
                return
              }

              updateField(
                'network',
                value as NftNetwork,
              )
            }}
          >
            <SelectTrigger
              className={inputClassName}
            >
              <SelectValue placeholder="Selecione uma rede" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ethereum">
                Ethereum
              </SelectItem>

              <SelectItem value="polygon">
                Polygon
              </SelectItem>

              <SelectItem value="solana">
                Solana
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Nome do perfil"
          required
        >
          <Input
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
            placeholder="Nome do perfil da carteira"
            className={inputClassName}
          />
        </Field>

        <Field
          label="Endereço da carteira"
          required
        >
          <Input
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
            placeholder="0x... ou endereço da carteira"
            className={inputClassName}
          />
        </Field>

        <Field label="Carteira / ENS secundária">
          <Input
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
          <Select
            value={
              form.provider || null
            }
            onValueChange={(value) => {
              if (value === null) {
                return
              }

              updateField(
                'provider',
                value as WalletProvider,
              )
            }}
          >
            <SelectTrigger
              className={inputClassName}
            >
              <SelectValue placeholder="Selecione uma carteira" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="metamask">
                MetaMask
              </SelectItem>

              <SelectItem value="coinbase">
                Coinbase Wallet
              </SelectItem>

              <SelectItem value="walletconnect">
                WalletConnect
              </SelectItem>

              <SelectItem value="other">
                Outra
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Código de indicação">
          <Input
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
            placeholder="Código de indicação (opcional)"
            className={inputClassName}
          />
        </Field>

        <Field
          label="E-mail"
          required
        >
          <Input
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
            autoComplete="email"
            placeholder="email@exemplo.com"
            className={inputClassName}
          />
        </Field>

        <Field label="Nome ENS">
          <div className="flex">
            <Input
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

                max-md:h-[44px]
                max-md:rounded-r-[10px]
                max-md:px-[14px]
                max-md:text-[12px]
              "
            >
              .eth
            </div>
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

      <div
        className="
          mt-5
          flex
          items-center
          gap-3

          max-md:mt-[20px]
          max-md:flex-col
          max-md:items-stretch
          max-md:gap-[10px]
        "
      >
        <Button
          type="submit"
          disabled={
            saveWallet.isPending
          }
          className="
            h-10
            rounded-md
            bg-[var(--color-primary-kurio)]
            px-5
            text-xs
            font-semibold
            text-[var(--color-ink)]
            hover:bg-[var(--color-primary-kurio)]
            hover:opacity-90

            max-md:h-[48px]
            max-md:w-full
            max-md:rounded-[24px]
            max-md:text-[14px]
            max-md:font-bold
          "
        >
          {saveWallet.isPending
            ? 'Salvando...'
            : 'Salvar carteira'}
        </Button>

        {wallet && (
          <Button
            type="button"
            variant="ghost"
            disabled={
              deleteWallet.isPending
            }
            onClick={() => {
              void handleDelete()
            }}
            className="
              h-10
              gap-2
              px-3
              text-xs
              font-normal
              text-[var(--color-text-secondary)]
              hover:bg-transparent
              hover:text-red-400

              max-md:h-[44px]
              max-md:w-full
              max-md:justify-center
              max-md:rounded-[22px]
              max-md:border
              max-md:border-[var(--color-border-kurio)]
              max-md:text-[13px]
            "
          >
            <Trash2
              size={14}
            />

            Remover
          </Button>
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
      <span
        className="
          mb-2
          block
          text-xs
          font-medium
          leading-4
          text-[var(--color-foreground-kurio)]

          max-md:mb-[7px]
          max-md:text-[13px]
          max-md:leading-[16px]
        "
      >
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

  max-md:h-[44px]
  max-md:rounded-[10px]
  max-md:px-[14px]
  max-md:text-[13px]
  max-md:leading-[20px]
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
      <section
        aria-label="Carregando carteiras"
        className="
          w-full
          max-w-225

          max-md:mx-auto
          max-md:max-w-[366px]
        "
      >
        <div
          className="
            h-7
            w-48
            animate-pulse
            rounded-md
            bg-[var(--color-surface-card)]

            max-md:h-[24px]
            max-md:w-[180px]
            max-md:rounded-[8px]
          "
        />

        <div
          className="
            mt-6
            grid
            gap-x-6
            gap-y-4
            md:grid-cols-2

            max-md:mt-[20px]
            max-md:gap-y-[16px]
          "
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <div
                className="
                  h-4
                  w-28
                  animate-pulse
                  rounded-sm
                  bg-[var(--color-surface-card)]

                  max-md:h-[16px]
                "
              />

              <div
                className="
                  h-10
                  animate-pulse
                  rounded-md
                  bg-[var(--color-surface-card)]

                  max-md:h-[44px]
                  max-md:rounded-[10px]
                "
              />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <p
        className="
          text-xs
          text-red-400

          max-md:text-[13px]
          max-md:leading-[20px]
        "
      >
        Não foi possível carregar suas carteiras.
      </p>
    )
  }

  return (
    <section
      className="
        w-full
        max-w-225

        max-md:mx-auto
        max-md:max-w-[366px]
      "
    >
      <div>
        <div
          className="
            flex
            items-start
            justify-between
            gap-5

            max-md:gap-[16px]
          "
        >
          <div>
            <h1
              className="
                text-xl
                font-semibold
                leading-7
                text-[var(--color-foreground-kurio)]

                max-md:text-[20px]
                max-md:font-bold
                max-md:leading-[24px]
              "
            >
              Carteira principal
            </h1>

            <p
              className="
                mt-1.5
                max-w-150
                text-xs
                leading-5
                text-[var(--color-text-secondary)]

                max-md:mt-[6px]
                max-md:max-w-none
                max-md:text-[13px]
                max-md:leading-[20px]
              "
            >
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
          </div>

          {!primaryWallet && (
            <span
              className="
                text-xs
                font-medium
                text-[var(--color-text-accent)]

                max-md:pt-[3px]
                max-md:text-[12px]
                max-md:leading-[16px]
              "
            >
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

      <div
        className="
          mt-10
          border-t
          border-[var(--color-border-kurio)]
          pt-8

          max-md:mt-[32px]
          max-md:pt-[24px]
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-4

            max-md:gap-[14px]
          "
        >
          <div>
            <h2
              className="
                text-base
                font-semibold
                leading-6
                text-[var(--color-foreground-kurio)]

                max-md:text-[18px]
                max-md:font-bold
                max-md:leading-[22px]
              "
            >
              Carteira secundária
            </h2>

            <p
              className="
                mt-1.5
                max-w-150
                text-xs
                leading-5
                text-[var(--color-text-secondary)]

                max-md:mt-[6px]
                max-md:max-w-none
                max-md:text-[13px]
                max-md:leading-[20px]
              "
            >
              Use uma segunda carteira para organizar recebimentos ou pagamentos alternativos.
            </p>
          </div>

          {!secondaryWallet &&
            !showSecondary && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowSecondary(
                    true,
                  )
                }}
                className="
                  h-9
                  gap-2
                  px-3
                  text-xs
                  font-medium
                  text-[var(--color-text-accent)]
                  hover:bg-[rgba(210,138,76,0.08)]
                  hover:text-[var(--color-text-accent)]

                  max-md:h-[40px]
                  max-md:rounded-[20px]
                  max-md:px-[14px]
                  max-md:text-[13px]
                "
              >
                <Plus
                  size={14}
                />

                Adicionar
              </Button>
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