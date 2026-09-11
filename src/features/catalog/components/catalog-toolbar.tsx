import { useNavigate } from '@tanstack/react-router'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const sortOptions: Array<{
  label: string
  value: CatalogSort
}> = [
  {
    label: 'Listados recentemente',
    value: 'featured',
  },
  {
    label: 'Menor preço',
    value: 'price-asc',
  },
  {
    label: 'Maior preço',
    value: 'price-desc',
  },
  {
    label: 'Mais recentes',
    value: 'newest',
  },
]

export function CatalogToolbar({
  params,
}: CatalogToolbarProps) {
  const navigate = useNavigate({
    from: '/',
  })

  const currentSort =
    params.sort ?? 'featured'

  const currentSortLabel =
    sortOptions.find(
      (option) =>
        option.value ===
        currentSort,
    )?.label ??
    'Listados recentemente'

  function updateSearch(
    updates: Partial<CatalogParams>,
  ) {
    void navigate({
      search: (previous) => ({
        ...previous,
        ...updates,
        page: 1,
      }),

      resetScroll: false,
    })
  }

  function selectTab(
    tab: CatalogTab,
  ) {
    updateSearch({
      tab,
    })
  }

  function changeSort(
    sort: CatalogSort,
  ) {
    updateSearch({
      sort,
    })
  }

  return (
    <div
      id="catalog-toolbar"
      className="
        flex
        scroll-mt-16
        items-center
        justify-between
      "
    >
      <div
        className="
          flex
          h-4
          items-center
          gap-5
        "
        role="tablist"
        aria-label="Visualização do catálogo"
      >
        {tabs.map((tab) => {
          const active =
            (params.tab ?? 'all') ===
            tab.value

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                selectTab(
                  tab.value,
                )
              }
              className={`
                text-[15px]
                font-medium
                leading-4
                transition-colors
                ${
                  active
                    ? 'text-[var(--color-text-accent)]'
                    : 'text-foreground hover:text-[var(--color-text-accent)]'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className="
          flex
          items-center
          gap-1.5
          text-[15px]
        "
      >
        <span
          className="
            whitespace-nowrap
            text-foreground
          "
        >
          Ordenar por:
        </span>

        <Select
          value={currentSort}
          onValueChange={(
            value,
          ) => {
            if (!value) {
              return
            }

            changeSort(
              value as CatalogSort,
            )
          }}
        >
          <SelectTrigger
            aria-label="Ordenar NFTs"
            className="
              h-8
              min-w-[205px]
              border-0
              bg-transparent
              px-2
              text-[15px]
              text-[var(--text-primary-kurio)]
              shadow-none
              outline-none
              transition-colors
              hover:bg-[var(--color-surface-card)]
              hover:text-[var(--text-primary-kurio)]
              focus-visible:ring-1
              focus-visible:ring-[var(--color-primary-kurio)]
            "
          >
            <SelectValue>
              {currentSortLabel}
            </SelectValue>
          </SelectTrigger>

          <SelectContent
            className="
              border
              border-[var(--color-border-kurio)]
              bg-[var(--color-surface-card)]
              text-[var(--text-primary-kurio)]
            "
          >
            {sortOptions.map(
              (option) => (
                <SelectItem
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                  className="
                    cursor-pointer
                    text-[14px]
                    text-[var(--text-primary-kurio)]
                    outline-none

                    hover:bg-[var(--color-border-kurio)]
                    hover:text-[var(--color-text-accent)]

                    focus:bg-[var(--color-border-kurio)]
                    focus:text-[var(--color-text-accent)]

                    data-[highlighted]:bg-[var(--color-border-kurio)]
                    data-[highlighted]:text-[var(--color-text-accent)]

                    data-[state=checked]:bg-[var(--color-border-kurio)]
                    data-[state=checked]:text-[var(--color-text-accent)]
                  "
                >
                  {
                    option.label
                  }
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}