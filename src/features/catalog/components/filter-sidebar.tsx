import {
  useNavigate,
} from '@tanstack/react-router'

import {
  useState,
} from 'react'

import {
  Slider,
} from '@/components/ui/slider'

import type {
  NftNetwork,
} from '@/features/nft/types/nft'

import type {
  CatalogParams,
} from '../types/catalog'

const MIN_PRICE = 0.02
const MAX_PRICE = 12.3
const PRICE_STEP = 0.01

const collections = [
  [
    'Arte digital',
    'digital-art',
    10,
  ],
  [
    'Fotografia',
    'photography',
    3,
  ],
  [
    'Música',
    'music',
    3,
  ],
  [
    'Arte 3D',
    '3d-art',
    3,
  ],
  [
    'Colecionáveis',
    'collectibles',
    3,
  ],
  [
    'Generativa',
    'generative',
    3,
  ],
  [
    'Jogos',
    'games',
    3,
  ],
  [
    'Assinaturas',
    'memberships',
    3,
  ],
  [
    'Utilidade',
    'utility',
    3,
  ],
] as const

const networks: Array<{
  label: string
  value: NftNetwork
  count: number
}> = [
  {
    label: 'Ethereum',
    value: 'ethereum',
    count: 12,
  },
  {
    label: 'Polygon',
    value: 'polygon',
    count: 11,
  },
  {
    label: 'Solana',
    value: 'solana',
    count: 11,
  },
]

type FilterSidebarProps = {
  params: CatalogParams
}

type PriceRangeProps = {
  initialMinPrice: number
  initialMaxPrice: number
  onApply: (
    minPrice: number,
    maxPrice: number,
  ) => void
}

function formatPrice(
  value: number,
) {
  return value
    .toFixed(2)
    .replace('.', ',')
}

function PriceRange({
  initialMinPrice,
  initialMaxPrice,
  onApply,
}: PriceRangeProps) {
  const [
    priceRange,
    setPriceRange,
  ] = useState<number[]>([
    initialMinPrice,
    initialMaxPrice,
  ])

  const minPrice =
    priceRange[0] ??
    MIN_PRICE

  const maxPrice =
    priceRange[1] ??
    MAX_PRICE

  function handlePriceRangeChange(
    value:
      | number
      | readonly number[],
  ) {
    if (
      typeof value ===
      'number'
    ) {
      return
    }

    setPriceRange([
      ...value,
    ])
  }

  return (
    <section
      className="
        mt-6
        flex
        w-[270px]
        flex-col
        gap-3
      "
    >
      <h2
        className="
          text-[18px]
          font-bold
          leading-4
          text-foreground
        "
      >
        Faixa de preço
      </h2>

      <div className="px-3">
        <Slider
          aria-label="Faixa de preço"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={
            priceRange
          }
          onValueChange={
            handlePriceRangeChange
          }
        />
      </div>

      <p
        className="
          px-3
          text-[15px]
          font-normal
          leading-[15px]
          text-foreground
        "
      >
        Preço:{' '}
        {formatPrice(
          minPrice,
        )}{' '}
        -{' '}
        {formatPrice(
          maxPrice,
        )}{' '}
        ETH
      </p>

      <button
        type="button"
        onClick={() =>
          onApply(
            minPrice,
            maxPrice,
          )
        }
        className="
          ml-3
          h-9
          w-[92px]
          rounded-md
          bg-primary
          px-3
          py-2
          text-[15px]
          font-bold
          text-primary-foreground
        "
      >
        Aplicar
      </button>
    </section>
  )
}

export function FilterSidebar({
  params,
}: FilterSidebarProps) {
  const navigate =
    useNavigate({
      from: '/',
    })

  function updateFilters(
    updates: Partial<CatalogParams>,
  ) {
    void navigate({
      search: (
        previous,
      ) => ({
        ...previous,
        ...updates,
        page: 1,
      }),

      resetScroll: false,
    })
  }

  function toggleCategory(
    category: string,
  ) {
    updateFilters({
      category:
        params.category ===
        category
          ? undefined
          : category,
    })
  }

  function toggleNetwork(
    network: NftNetwork,
  ) {
    updateFilters({
      network:
        params.network ===
        network
          ? undefined
          : network,
    })
  }

  function applyPrice(
    minPrice: number,
    maxPrice: number,
  ) {
    updateFilters({
      minPrice:
        minPrice.toFixed(
          2,
        ),

      maxPrice:
        maxPrice.toFixed(
          2,
        ),
    })
  }

  const initialMinPrice =
    Number(
      params.minPrice ??
        MIN_PRICE,
    )

  const initialMaxPrice =
    Number(
      params.maxPrice ??
        MAX_PRICE,
    )

  return (
    <aside
      className="
        w-[310px]
        bg-card
        p-5
      "
    >
      <section
        className="
          flex
          w-[270px]
          flex-col
          gap-3
        "
      >
        <h2
          className="
            text-[18px]
            font-bold
            leading-4
            text-foreground
          "
        >
          Coleções
        </h2>

        <div className="px-3">
          {collections.map(
            ([
              label,
              value,
              count,
            ]) => {
              const active =
                params.category ===
                value

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={
                    active
                  }
                  onClick={() =>
                    toggleCategory(
                      value,
                    )
                  }
                  className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-between
                  "
                >
                  <span
                    className={`
                      text-[15px]
                      font-normal
                      leading-10
                      ${
                        active
                          ? 'text-[var(--color-text-accent)]'
                          : 'text-muted-foreground'
                      }
                    `}
                  >
                    {label}
                  </span>

                  <span
                    className={`
                      text-[15px]
                      leading-10
                      ${
                        active
                          ? 'font-bold text-[var(--color-text-accent)]'
                          : 'font-normal text-muted-foreground'
                      }
                    `}
                  >
                    ({count})
                  </span>
                </button>
              )
            },
          )}
        </div>
      </section>

      <PriceRange
        key={`${params.minPrice ?? MIN_PRICE}-${params.maxPrice ?? MAX_PRICE}`}
        initialMinPrice={
          initialMinPrice
        }
        initialMaxPrice={
          initialMaxPrice
        }
        onApply={
          applyPrice
        }
      />

      <section
        className="
          mt-8
          flex
          w-[270px]
          flex-col
          gap-3
        "
      >
        <h2
          className="
            text-[18px]
            font-bold
            leading-4
            text-foreground
          "
        >
          Rede
        </h2>

        <div>
          {networks.map(
            ({
              label,
              value,
              count,
            }) => {
              const active =
                params.network ===
                value

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={
                    active
                  }
                  onClick={() =>
                    toggleNetwork(
                      value,
                    )
                  }
                  className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-between
                    px-3
                  "
                >
                  <span
                    className={`
                      text-[15px]
                      font-normal
                      leading-10
                      ${
                        active
                          ? 'text-[var(--color-text-accent)]'
                          : 'text-muted-foreground'
                      }
                    `}
                  >
                    {label}
                  </span>

                  <span
                    className={`
                      text-[15px]
                      leading-10
                      ${
                        active
                          ? 'font-bold text-[var(--color-text-accent)]'
                          : 'font-normal text-muted-foreground'
                      }
                    `}
                  >
                    ({count})
                  </span>
                </button>
              )
            },
          )}
        </div>
      </section>
    </aside>
  )
}