import type {
  ChangeEvent,
  FormEvent,
} from 'react'
import {
  useState,
} from 'react'

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

export function CollectorProfileForm({
  value,
  onChange,
  disabled = false,
}: CollectorProfileFormProps) {
  const [submitted, setSubmitted] =
    useState(false)

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

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >,
  ) {
    const {
      name,
      value: fieldValue,
    } = event.target

    updateField(
      name as keyof CollectorProfileInput,
      fieldValue as never,
    )
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setSubmitted(true)
  }

  const showDisplayNameError =
    submitted &&
    !value.displayName.trim()

  const showUsernameError =
    submitted &&
    !value.username.trim()

  const showNetworkError =
    submitted &&
    !value.network

  const showProfileNameError =
    submitted &&
    !value.profileName.trim()

  const showWalletAddressError =
    submitted &&
    !value.walletAddress.trim()

  const showWalletTypeError =
    submitted &&
    !value.walletType.trim()

  const showEmailError =
    submitted &&
    !value.email.trim()

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-[10px] font-bold text-foreground"
          >
            Nome de exibição *
          </label>

          <input
            id="displayName"
            name="displayName"
            type="text"
            value={value.displayName}
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          {showDisplayNameError && (
            <p className="mt-1 text-[9px] text-destructive">
              Informe o nome de exibição.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-[10px] font-bold text-foreground"
          >
            Nome de usuário *
          </label>

          <input
            id="username"
            name="username"
            type="text"
            value={value.username}
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          {showUsernameError && (
            <p className="mt-1 text-[9px] text-destructive">
              Informe o nome de usuário.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="network"
            className="block text-[10px] font-bold text-foreground"
          >
            Rede *
          </label>

          <select
            id="network"
            name="network"
            value={value.network}
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-ink)]
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
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

          {showNetworkError && (
            <p className="mt-1 text-[9px] text-destructive">
              Selecione uma rede.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profileName"
            className="block text-[10px] font-bold text-foreground"
          >
            Nome do perfil *
          </label>

          <input
            id="profileName"
            name="profileName"
            type="text"
            value={value.profileName}
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          {showProfileNameError && (
            <p className="mt-1 text-[9px] text-destructive">
              Informe o nome do perfil.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="walletAddress"
            className="block text-[10px] font-bold text-foreground"
          >
            Endereço da carteira *
          </label>

          <input
            id="walletAddress"
            name="walletAddress"
            type="text"
            value={value.walletAddress}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder="0x..."
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              placeholder:text-[var(--color-text-secondary)]
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          {showWalletAddressError && (
            <p className="mt-1 text-[9px] text-destructive">
              Informe o endereço da carteira.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="secondaryWallet"
            className="block text-[10px] font-bold text-foreground"
          >
            ENS ou carteira secundária
            (opcional)
          </label>

          <input
            id="secondaryWallet"
            name="secondaryWallet"
            type="text"
            value={
              value.secondaryWallet ?? ''
            }
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        <div>
          <label
            htmlFor="walletType"
            className="block text-[10px] font-bold text-foreground"
          >
            Tipo de carteira *
          </label>

          <select
            id="walletType"
            name="walletType"
            value={value.walletType}
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-ink)]
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <option value="">
              Selecione uma carteira
            </option>

            <option value="hot">
              Hot wallet
            </option>

            <option value="cold">
              Cold wallet
            </option>
          </select>

          {showWalletTypeError && (
            <p className="mt-1 text-[9px] text-destructive">
              Selecione o tipo de carteira.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="referralCode"
            className="block text-[10px] font-bold text-foreground"
          >
            Código de indicação
          </label>

          <input
            id="referralCode"
            name="referralCode"
            type="text"
            value={
              value.referralCode ?? ''
            }
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[10px] font-bold text-foreground"
          >
            E-mail *
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={value.email}
            onChange={handleInputChange}
            disabled={disabled}
            className="
              mt-1.5
              h-9 w-full
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          {showEmailError && (
            <p className="mt-1 text-[9px] text-destructive">
              Informe o e-mail.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ensName"
            className="block text-[10px] font-bold text-foreground"
          >
            Nome ENS
          </label>

          <div className="mt-1.5 flex">
            <input
              id="ensName"
              name="ensName"
              type="text"
              value={value.ensName ?? ''}
              onChange={handleInputChange}
              disabled={disabled}
              className="
                h-9 min-w-0 flex-1
                border
                border-[var(--color-border-kurio)]
                bg-transparent
                px-3
                text-[10px]
                text-foreground
                outline-none
                focus:border-[var(--color-primary-kurio)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />

            <div
              className="
                flex h-9 items-center
                border
                border-l-0
                border-[var(--color-border-kurio)]
                px-3
                text-[10px]
                text-[var(--color-text-secondary)]
              "
            >
              .eth
            </div>
          </div>
        </div>

        <label
          className="
            flex cursor-pointer
            items-center gap-2
            text-[10px]
            text-foreground
          "
        >
          <input
            type="checkbox"
            checked={
              value.useAnotherWallet
            }
            onChange={(event) => {
              updateField(
                'useAnotherWallet',
                event.target.checked,
              )
            }}
            disabled={disabled}
            className="size-3.5"
          />

          Usar outra carteira?
        </label>

        <div className="col-span-2">
          <label
            htmlFor="collectionNote"
            className="block text-[10px] font-bold text-foreground"
          >
            Observação do colecionador
            (opcional)
          </label>

          <textarea
            id="collectionNote"
            name="collectionNote"
            value={
              value.collectionNote ?? ''
            }
            onChange={handleInputChange}
            disabled={disabled}
            rows={4}
            className="
              mt-1.5
              min-h-24 w-full
              resize-y
              border
              border-[var(--color-border-kurio)]
              bg-transparent
              px-3 py-2
              text-[10px]
              text-foreground
              outline-none
              focus:border-[var(--color-primary-kurio)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>
      </div>
    </form>
  )
}