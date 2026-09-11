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
        justify-start
        lg:justify-between
      "
    >
      <div
        className="
          flex
          h-5
          w-full
          items-center
          justify-center
          gap-3
          lg:h-4
          lg:w-auto
          lg:justify-start
          lg:gap-5
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
                relative
                flex
                h-5
                items-center
                justify-center
                whitespace-nowrap
                px-0
                text-[12px]
                font-medium
                leading-4
                transition-colors
                lg:h-auto
                lg:text-[15px]
                ${
                  active
                    ? 'text-[var(--color-text-accent)]'
                    : 'text-foreground hover:text-[var(--color-text-accent)]'
                }
              `}
            >
              {tab.label}

              {active && (
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    right-0
                    bottom-0
                    left-0
                    h-px
                    bg-[var(--color-primary-kurio)]
                    lg:hidden
                  "
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        className="
          hidden
          items-center
          gap-1.5
          text-[15px]
          lg:flex
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
