import {
  useState,
  type FocusEvent,
} from 'react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type {
  CollectorProfileInput,
} from '../types/checkout'

type CollectorProfileFormProps = {
  value: CollectorProfileInput

  onChange: (
    value: CollectorProfileInput,
  ) => void

  disabled?: boolean
}

type TouchedFields = Partial<
  Record<
    keyof CollectorProfileInput,
    boolean
  >
>

const inputClassName = `
  h-10
  rounded-md
  border-[var(--color-border-kurio)]
  bg-transparent
  px-2.75
  text-xs
  leading-4.5
  text-[var(--color-foreground-kurio)]
  shadow-none
  placeholder:text-[var(--color-text-secondary)]
  focus-visible:border-[var(--color-primary-kurio)]
  focus-visible:ring-[var(--color-primary-kurio)]/15
  disabled:cursor-not-allowed
  disabled:opacity-50
`

const selectTriggerClassName = `
  h-10
  w-full
  rounded-md
  border-[var(--color-border-kurio)]
  bg-transparent
  px-2.75
  text-xs
  text-[var(--color-foreground-kurio)]
  shadow-none
  focus-visible:border-[var(--color-primary-kurio)]
  focus-visible:ring-[var(--color-primary-kurio)]/15
  disabled:cursor-not-allowed
  disabled:opacity-50
`

const labelClassName = `
  block
  text-xs
  font-medium
  leading-4
  text-[var(--color-foreground-kurio)]
`

const errorClassName = `
  mt-1.25
  text-[10px]
  leading-[15px]
  text-destructive
`

export function CollectorProfileForm({
  value,
  onChange,
  disabled = false,
}: CollectorProfileFormProps) {
  const [
    touched,
    setTouched,
  ] =
    useState<TouchedFields>(
      {},
    )

  function updateField<
    Key extends keyof CollectorProfileInput,
  >(
    key: Key,
    fieldValue:
      CollectorProfileInput[Key],
  ) {
    onChange({
      ...value,
      [key]: fieldValue,
    })
  }

  function markTouched(
    field:
      keyof CollectorProfileInput,
  ) {
    setTouched(
      (current) => ({
        ...current,
        [field]: true,
      }),
    )
  }

  function handleBlur(
    event: FocusEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >,
  ) {
    markTouched(
      event.target
        .name as keyof CollectorProfileInput,
    )
  }

  const showDisplayNameError =
    touched.displayName &&
    !value.displayName.trim()

  const showUsernameError =
    touched.username &&
    !value.username.trim()

  const showNetworkError =
    touched.network &&
    !value.network

  const showProfileNameError =
    touched.profileName &&
    !value.profileName.trim()

  const showWalletAddressError =
    touched.walletAddress &&
    !value.walletAddress.trim()

  const showWalletTypeError =
    touched.walletType &&
    !value.walletType.trim()

  const showEmailError =
    touched.email &&
    !value.email.trim()

  return (
    <form
      className="
        w-full
      "
      onSubmit={(
        event,
      ) => {
        event.preventDefault()
      }}
    >
      <div
        className="
          grid
          grid-cols-2
          gap-x-6
          gap-y-5
        "
      >
        <div>
          <label
            htmlFor="displayName"
            className={
              labelClassName
            }
          >
            Nome de exibição{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <Input
            id="displayName"
            name="displayName"
            type="text"
            value={
              value.displayName
            }
            onChange={(
              event,
            ) => {
              updateField(
                'displayName',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            aria-invalid={
              Boolean(
                showDisplayNameError,
              )
            }
            autoComplete="name"
            placeholder="Seu nome de exibição"
            className={`
              mt-1.75
              ${inputClassName}
            `}
          />

          {showDisplayNameError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Informe o nome de
              exibição.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="username"
            className={
              labelClassName
            }
          >
            Nome de usuário{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <Input
            id="username"
            name="username"
            type="text"
            value={
              value.username
            }
            onChange={(
              event,
            ) => {
              updateField(
                'username',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            aria-invalid={
              Boolean(
                showUsernameError,
              )
            }
            autoComplete="username"
            placeholder="@usuario"
            className={`
              mt-1.75
              ${inputClassName}
            `}
          />

          {showUsernameError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Informe o nome de
              usuário.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="network"
            className={
              labelClassName
            }
          >
            Rede{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <div
            className="
              mt-1.75
            "
          >
            <Select
              value={
                value.network
              }
              onValueChange={(
                nextNetwork,
              ) => {
                if (nextNetwork === null) {
                  return
                }

                updateField(
                  'network',
                  nextNetwork as CollectorProfileInput['network'],
                )

                markTouched(
                  'network',
                )
              }}
              disabled={
                disabled
              }
            >
              <SelectTrigger
                id="network"
                aria-invalid={
                  Boolean(
                    showNetworkError,
                  )
                }
                className={
                  selectTriggerClassName
                }
              >
                <SelectValue
                  placeholder="Selecione uma rede"
                />
              </SelectTrigger>

              <SelectContent
                className="
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  text-[var(--color-foreground-kurio)]
                "
              >
                <SelectItem
                  value="ethereum"
                  className="
                    text-xs
                  "
                >
                  Ethereum
                </SelectItem>

                <SelectItem
                  value="polygon"
                  className="
                    text-xs
                  "
                >
                  Polygon
                </SelectItem>

                <SelectItem
                  value="solana"
                  className="
                    text-xs
                  "
                >
                  Solana
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showNetworkError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Selecione uma rede.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profileName"
            className={
              labelClassName
            }
          >
            Nome do perfil{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <Input
            id="profileName"
            name="profileName"
            type="text"
            value={
              value.profileName
            }
            onChange={(
              event,
            ) => {
              updateField(
                'profileName',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            aria-invalid={
              Boolean(
                showProfileNameError,
              )
            }
            placeholder="Nome do perfil"
            className={`
              mt-1.75
              ${inputClassName}
            `}
          />

          {showProfileNameError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Informe o nome do
              perfil.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="walletAddress"
            className={
              labelClassName
            }
          >
            Endereço da carteira{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <Input
            id="walletAddress"
            name="walletAddress"
            type="text"
            value={
              value.walletAddress
            }
            onChange={(
              event,
            ) => {
              updateField(
                'walletAddress',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            aria-invalid={
              Boolean(
                showWalletAddressError,
              )
            }
            autoComplete="off"
            spellCheck={false}
            placeholder="0x..."
            className={`
              mt-1.75
              font-mono
              ${inputClassName}
            `}
          />

          {showWalletAddressError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Informe o endereço da
              carteira.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="secondaryWallet"
            className={
              labelClassName
            }
          >
            ENS ou carteira secundária{' '}
            <span
              className="
                font-normal
                text-[var(--color-text-secondary)]
              "
            >
              (opcional)
            </span>
          </label>

          <Input
            id="secondaryWallet"
            name="secondaryWallet"
            type="text"
            value={
              value.secondaryWallet ??
              ''
            }
            onChange={(
              event,
            ) => {
              updateField(
                'secondaryWallet',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            placeholder="0x... ou nome.eth"
            className={`
              mt-1.75
              ${inputClassName}
            `}
          />
        </div>

        <div>
          <label
            htmlFor="walletType"
            className={
              labelClassName
            }
          >
            Tipo de carteira{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <div
            className="
              mt-1.75
            "
          >
            <Select
              value={
                value.walletType
              }
              onValueChange={(
                nextWalletType,
              ) => {
                if (nextWalletType === null) {
                  return
                }

                updateField(
                  'walletType',
                  nextWalletType,
                )

                markTouched(
                  'walletType',
                )
              }}
              disabled={
                disabled
              }
            >
              <SelectTrigger
                id="walletType"
                aria-invalid={
                  Boolean(
                    showWalletTypeError,
                  )
                }
                className={
                  selectTriggerClassName
                }
              >
                <SelectValue
                  placeholder="Selecione uma carteira"
                />
              </SelectTrigger>

              <SelectContent
                className="
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  text-[var(--color-foreground-kurio)]
                "
              >
                <SelectItem
                  value="metamask"
                  className="
                    text-xs
                  "
                >
                  MetaMask
                </SelectItem>

                <SelectItem
                  value="coinbase"
                  className="
                    text-xs
                  "
                >
                  Coinbase Wallet
                </SelectItem>

                <SelectItem
                  value="hot"
                  className="
                    text-xs
                  "
                >
                  Hot wallet
                </SelectItem>

                <SelectItem
                  value="cold"
                  className="
                    text-xs
                  "
                >
                  Cold wallet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showWalletTypeError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Selecione o tipo de
              carteira.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="referralCode"
            className={
              labelClassName
            }
          >
            Código de indicação
          </label>

          <Input
            id="referralCode"
            name="referralCode"
            type="text"
            value={
              value.referralCode ??
              ''
            }
            onChange={(
              event,
            ) => {
              updateField(
                'referralCode',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            autoComplete="off"
            placeholder="Código de indicação"
            className={`
              mt-1.75
              ${inputClassName}
            `}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className={
              labelClassName
            }
          >
            E-mail{' '}
            <span
              className="
                text-[var(--color-text-accent)]
              "
            >
              *
            </span>
          </label>

          <Input
            id="email"
            name="email"
            type="email"
            value={
              value.email
            }
            onChange={(
              event,
            ) => {
              updateField(
                'email',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            aria-invalid={
              Boolean(
                showEmailError,
              )
            }
            autoComplete="email"
            placeholder="email@exemplo.com"
            className={`
              mt-1.75
              ${inputClassName}
            `}
          />

          {showEmailError && (
            <p
              role="alert"
              className={
                errorClassName
              }
            >
              Informe o e-mail.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ensName"
            className={
              labelClassName
            }
          >
            Nome ENS
          </label>

          <div
            className="
              mt-1.75
              flex
            "
          >
            <Input
              id="ensName"
              name="ensName"
              type="text"
              value={
                value.ensName ??
                ''
              }
              onChange={(
                event,
              ) => {
                updateField(
                  'ensName',
                  event.target
                    .value,
                )
              }}
              onBlur={
                handleBlur
              }
              disabled={
                disabled
              }
              autoComplete="off"
              placeholder="seunome"
              className={`
                min-w-0
                flex-1
                rounded-r-none
                border-r-0
                ${inputClassName}
              `}
            />

            <div
              className="
                flex
                h-10
                shrink-0
                items-center
                rounded-r-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                px-2.75
                text-[11px]
                font-medium
                text-[var(--color-text-secondary)]
              "
            >
              .eth
            </div>
          </div>
        </div>

        <div
          className="
            flex
            min-h-10
            items-center
          "
        >
          <label
            className="
              inline-flex
              cursor-pointer
              items-center
              gap-2.25
              text-xs
              leading-4.25
              text-[var(--color-foreground-kurio)]
            "
          >
            <input
              type="checkbox"
              checked={
                value.useAnotherWallet
              }
              onChange={(
                event,
              ) => {
                updateField(
                  'useAnotherWallet',
                  event.target
                    .checked,
                )
              }}
              disabled={
                disabled
              }
              className="
                h-3.75
                w-3.75
                cursor-pointer
                accent-[var(--color-primary-kurio)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />

            Usar outra carteira?
          </label>
        </div>

        <div
          aria-hidden="true"
        />

        <div
          className="
            col-span-2
          "
        >
          <label
            htmlFor="collectionNote"
            className={
              labelClassName
            }
          >
            Observação do colecionador{' '}
            <span
              className="
                font-normal
                text-[var(--color-text-secondary)]
              "
            >
              (opcional)
            </span>
          </label>

          <textarea
            id="collectionNote"
            name="collectionNote"
            value={
              value.collectionNote ??
              ''
            }
            onChange={(
              event,
            ) => {
              updateField(
                'collectionNote',
                event.target
                  .value,
              )
            }}
            onBlur={
              handleBlur
            }
            disabled={
              disabled
            }
            rows={4}
            placeholder="Adicione uma observação sobre sua coleção..."
            className="
              mt-1.75
              min-h-26
              w-full
              resize-y
              rounded-md
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-2.75
              py-2.25
              text-xs
              leading-4.75
              text-[var(--color-foreground-kurio)]
              outline-none
              transition-colors
              placeholder:text-[var(--color-text-secondary)]
              focus:border-[var(--color-primary-kurio)]
              focus:ring-3
              focus:ring-[var(--color-primary-kurio)]/15
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>
      </div>
    </form>
  )
}