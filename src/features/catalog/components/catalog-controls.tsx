import { useNavigate } from '@tanstack/react-router'
import type { CatalogParams } from '../types/catalog'

type CatalogControlsProps = {
  params: CatalogParams
}

export function CatalogControls({
  params,
}: CatalogControlsProps) {
  const navigate = useNavigate({ from: '/' })

  function updateSearch(
    updates: Partial<CatalogParams>,
    resetPage = true,
  ) {
    navigate({
      search: (previous) => ({
        ...previous,
        ...updates,
        ...(resetPage ? { page: 1 } : {}),
      }),
    })
  }

  return (
    <section className="mb-8 flex flex-wrap gap-4">
      <input
        type="search"
        value={params.search ?? ''}
        placeholder="Buscar NFTs..."
        aria-label="Buscar NFTs"
        onChange={(event) => {
          updateSearch({
            search: event.target.value || undefined,
          })
        }}
        className="rounded-md border bg-transparent px-3 py-2"
      />

      <select
        aria-label="Filtrar por rede"
        value={params.network ?? ''}
        onChange={(event) => {
          const value = event.target.value

          updateSearch({
            network:
              value === 'ethereum' ||
              value === 'polygon' ||
              value === 'solana'
                ? value
                : undefined,
          })
        }}
        className="rounded-md border bg-background px-3 py-2"
      >
        <option value="">Todas as redes</option>
        <option value="ethereum">Ethereum</option>
        <option value="polygon">Polygon</option>
        <option value="solana">Solana</option>
      </select>

      <select
        aria-label="Ordenar NFTs"
        value={params.sort ?? 'featured'}
        onChange={(event) => {
          const value = event.target.value

          if (
            value === 'featured' ||
            value === 'price-asc' ||
            value === 'price-desc' ||
            value === 'newest'
          ) {
            updateSearch({
              sort: value,
            })
          }
        }}
        className="rounded-md border bg-background px-3 py-2"
      >
        <option value="featured">Destaques</option>
        <option value="price-asc">Menor preço</option>
        <option value="price-desc">Maior preço</option>
        <option value="newest">Mais recentes</option>
      </select>
    </section>
  )
}