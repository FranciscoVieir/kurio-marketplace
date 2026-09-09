import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { CatalogParams } from '../types/catalog'
import type { NftNetwork } from '@/features/nft/types/nft'

const collections = [
  ['Arte digital', 'digital-art', 33],
  ['Fotografia', 'photography', 12],
  ['Música', 'music', 65],
  ['Arte 3D', '3d-art', 39],
  ['Colecionáveis', 'collectibles', 23],
  ['Generativa', 'generative', 17],
  ['Jogos', 'games', 19],
  ['Assinaturas', 'memberships', 13],
  ['Utilidade', 'utility', 18],
] as const

const networks: Array<{
  label: string
  value: NftNetwork
  count: number
}> = [
  {
    label: 'Ethereum',
    value: 'ethereum',
    count: 119,
  },
  {
    label: 'Polygon',
    value: 'polygon',
    count: 78,
  },
  {
    label: 'Solana',
    value: 'solana',
    count: 86,
  },
]

type FilterSidebarProps = {
  params: CatalogParams
}

export function FilterSidebar({
  params,
}: FilterSidebarProps) {
  const navigate = useNavigate({ from: '/' })

  const [minPrice, setMinPrice] = useState(
    params.minPrice ?? '0.02',
  )

  const [maxPrice, setMaxPrice] = useState(
    params.maxPrice ?? '12.30',
  )

  useEffect(() => {
    setMinPrice(params.minPrice ?? '0.02')
    setMaxPrice(params.maxPrice ?? '12.30')
  }, [params.minPrice, params.maxPrice])

  function updateFilters(
    updates: Partial<CatalogParams>,
  ) {
    navigate({
      search: (previous) => ({
        ...previous,
        ...updates,
        page: 1,
      }),
    })
  }

  function toggleCategory(category: string) {
    updateFilters({
      category:
        params.category === category
          ? undefined
          : category,
    })
  }

  function toggleNetwork(network: NftNetwork) {
    updateFilters({
      network:
        params.network === network
          ? undefined
          : network,
    })
  }

  function applyPrice() {
    updateFilters({
      minPrice,
      maxPrice,
    })
  }

  return (
    <aside className="w-[310px] bg-card p-5">
      <section className="flex w-[270px] flex-col gap-3">
        <h2 className="text-[18px] font-bold leading-[16px] text-foreground">
          Coleções
        </h2>

        <div className="px-3">
          {collections.map(
            ([label, value, count]) => {
              const active =
                params.category === value

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    toggleCategory(value)
                  }
                  className="
                    flex h-10 w-full
                    items-center justify-between
                  "
                >
                  <span
                    className={`
                      text-[15px] font-normal
                      leading-[40px]
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
                      leading-[40px]
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

      <section className="mt-6 flex w-[270px] flex-col gap-3">
        <h2 className="text-[18px] font-bold leading-[16px] text-foreground">
          Faixa de preço
        </h2>

        <div className="flex gap-2">
          <input
            aria-label="Preço mínimo"
            type="number"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(event.target.value)
            }
            className="
              h-9 min-w-0 flex-1
              rounded-[6px]
              border border-border
              bg-background px-2
              text-[13px] text-foreground
            "
          />

          <input
            aria-label="Preço máximo"
            type="number"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(event.target.value)
            }
            className="
              h-9 min-w-0 flex-1
              rounded-[6px]
              border border-border
              bg-background px-2
              text-[13px] text-foreground
            "
          />
        </div>

        <p className="text-[15px] font-normal leading-[15px] text-foreground">
          Preço: {minPrice || '0'} -{' '}
          {maxPrice || '0'} ETH
        </p>

        <button
          type="button"
          onClick={applyPrice}
          className="
            h-[36px] w-[92px]
            rounded-[6px]
            bg-primary px-3 py-2
            text-[15px] font-bold
            text-primary-foreground
          "
        >
          Aplicar
        </button>
      </section>

      <section className="mt-8 flex w-[270px] flex-col gap-3">
        <h2 className="text-[18px] font-bold leading-[16px] text-foreground">
          Rede
        </h2>

        <div>
          {networks.map(
            ({ label, value, count }) => {
              const active =
                params.network === value

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    toggleNetwork(value)
                  }
                  className="
                    flex h-10 w-full
                    items-center justify-between
                    px-3
                  "
                >
                  <span
                    className={`
                      text-[15px] font-normal
                      leading-[40px]
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
                      leading-[40px]
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