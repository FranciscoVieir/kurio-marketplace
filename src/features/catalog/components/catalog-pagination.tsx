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
  const navigate = useNavigate({ from: '/' })

  const currentPage = params.page ?? 1
  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  )

  function goToPage(page: number) {
    navigate({
      search: (previous) => ({
        ...previous,
        page,
      }),
    })
  }

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-8 flex items-center gap-4"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="rounded-md border px-4 py-2 disabled:opacity-40"
      >
        Anterior
      </button>

      <span>
        Página {currentPage} de {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="rounded-md border px-4 py-2 disabled:opacity-40"
      >
        Próxima
      </button>
    </nav>
  )
}