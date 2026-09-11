import { useNavigate } from '@tanstack/react-router'

import type { CatalogParams } from '../types/catalog'

type CatalogPaginationProps = {
  params: CatalogParams
  total: number
  pageSize: number
}

export function CatalogPagination({
  params,
  total,
  pageSize,
}: CatalogPaginationProps) {
  const navigate = useNavigate({
    from: '/',
  })

  const currentPage =
    params.page ?? 1

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  )

  const visiblePages = Array.from(
    {
      length: Math.min(
        totalPages,
        4,
      ),
    },
    (_, index) =>
      index + 1,
  )

  function goToPage(
    page: number,
  ) {
    if (
      page === currentPage ||
      page < 1 ||
      page > totalPages
    ) {
      return
    }

    const catalogToolbar =
      document.getElementById(
        'catalog-toolbar',
      )

    catalogToolbar?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    void navigate({
      search: (
        previous,
      ) => ({
        ...previous,
        page,
      }),

      resetScroll: false,
    })
  }

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="
        mt-8
        flex
        h-[35px]
        items-center
        justify-end
        gap-2
      "
    >
      {visiblePages.map(
        (page) => {
          const active =
            page ===
            currentPage

          return (
            <button
              key={page}
              type="button"
              aria-current={
                active
                  ? 'page'
                  : undefined
              }
              onClick={() =>
                goToPage(
                  page,
                )
              }
              className={`
                flex
                h-[35px]
                w-[35px]
                items-center
                justify-center
                rounded-[4px]
                text-[18px]
                leading-[16px]
                ${
                  active
                    ? `
                      bg-primary
                      font-bold
                      text-primary-foreground
                    `
                    : `
                      border
                      border-border
                      bg-transparent
                      font-normal
                      text-[var(--text-primary-kurio)]
                    `
                }
              `}
            >
              {page}
            </button>
          )
        },
      )}

      <button
        type="button"
        disabled={
          currentPage >=
          totalPages
        }
        onClick={() =>
          goToPage(
            currentPage +
              1,
          )
        }
        className="
          flex
          h-[35px]
          w-[35px]
          items-center
          justify-center
          rounded-[4px]
          border
          border-border
          text-[18px]
          text-[var(--text-primary-kurio)]
          disabled:opacity-40
        "
      >
        ›
      </button>
    </nav>
  )
}