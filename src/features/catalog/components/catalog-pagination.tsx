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
        flex
        h-8
        items-center
        justify-center
        gap-1.5
        lg:mt-8
        lg:h-[35px]
        lg:justify-end
        lg:gap-2
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
                size-8
                items-center
                justify-center
                rounded-[4px]
                text-[15px]
                leading-4
                lg:h-[35px]
                lg:w-[35px]
                lg:text-[18px]
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
        aria-label="Próxima página"
        onClick={() =>
          goToPage(
            currentPage +
              1,
          )
        }
        className="
          flex
          size-8
          items-center
          justify-center
          rounded-[4px]
          border
          border-border
          text-[16px]
          text-[var(--text-primary-kurio)]
          disabled:opacity-40
          lg:h-[35px]
          lg:w-[35px]
          lg:text-[18px]
        "
      >
        ›
      </button>
    </nav>
  )
}
