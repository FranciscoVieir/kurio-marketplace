import { useNavigate } from '@tanstack/react-router'
import type {
  CatalogParams,
  CatalogSort,
  CatalogTab,
} from '../types/catalog'

type CatalogToolbarProps = {
  params: CatalogParams
}

const tabs: Array<{
  label: string
  value: CatalogTab
}> = [
  {
    label: 'Todos os NFTs',
    value: 'all',
  },
  {
    label: 'Novos lançamentos',
    value: 'new',
  },
  {
    label: 'Em alta',
    value: 'trending',
  },
]

export function CatalogToolbar({
  params,
}: CatalogToolbarProps) {
  const navigate = useNavigate({ from: '/' })

  function updateSearch(
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

  function selectTab(tab: CatalogTab) {
    updateSearch({
      tab,
    })
  }

  function changeSort(sort: CatalogSort) {
    updateSearch({
      sort,
    })
  }

  return (
    <div className="flex items-center justify-between">
      <div
        className="
          flex h-4 items-center gap-5
        "
        role="tablist"
        aria-label="Visualização do catálogo"
      >
        {tabs.map((tab) => {
          const active =
            (params.tab ?? 'all') === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                selectTab(tab.value)
              }
              className={`
                text-[15px] font-medium
                leading-[16px]
                ${
                  active
                    ? 'text-[var(--color-text-accent)]'
                    : 'text-foreground'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <label className="flex items-center gap-1 text-[15px]">
        <span className="text-foreground">
          Ordenar por:
        </span>

        <select
          aria-label="Ordenar NFTs"
          value={params.sort ?? 'featured'}
          onChange={(event) =>
            changeSort(
              event.target.value as CatalogSort,
            )
          }
          className="
            bg-transparent
            text-[15px]
            text-foreground
            outline-none
          "
        >
          <option value="featured">
            Listados recentemente
          </option>

          <option value="price-asc">
            Menor preço
          </option>

          <option value="price-desc">
            Maior preço
          </option>

          <option value="newest">
            Mais recentes
          </option>
        </select>
      </label>
    </div>
  )
}