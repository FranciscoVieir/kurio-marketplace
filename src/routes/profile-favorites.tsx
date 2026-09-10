import {
  Link,
} from '@tanstack/react-router'

import {
  Heart,
  ShoppingCart,
} from 'lucide-react'

import {
  useCart,
} from '@/features/cart/hooks/use-cart'

import {
  useFavorites,
} from '@/features/favorites/hooks/use-favorites'

import {
  useFavoriteNfts,
} from '@/features/favorites/hooks/use-favorite-nfts'

export function ProfileFavoritesPage() {
  const {
    favoriteIds,
    removeFavorite,
  } = useFavorites()

  const {
    addItem,
    getItemQuantity,
  } = useCart()

  const {
    data: nfts = [],
    isLoading,
    isError,
  } =
    useFavoriteNfts(
      favoriteIds,
    )

  if (
    favoriteIds.length ===
    0
  ) {
    return (
      <section>
        <div>
          <h1 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
            Lista de interesse
          </h1>

          <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
            NFTs que você salvou para acompanhar depois.
          </p>
        </div>

        <div
          className="
            mt-8
            flex
            min-h-56
            flex-col
            items-center
            justify-center
            border
            border-[var(--color-border-kurio)]
            px-6
            text-center
          "
        >
          <Heart
            size={28}
            strokeWidth={1.4}
            className="text-[var(--color-text-accent)]"
          />

          <h2 className="mt-4 text-sm text-[var(--color-foreground-kurio)]">
            Sua lista está vazia
          </h2>

          <p className="mt-2 max-w-sm text-xs text-[var(--color-text-secondary)]">
            Favorite NFTs no marketplace para encontrá-los rapidamente aqui.
          </p>

          <Link
            to="/"
            className="
              mt-5
              rounded-[var(--radius-control)]
              bg-[var(--color-primary-kurio)]
              px-4
              py-2
              text-xs
              font-semibold
              text-[var(--color-ink)]
            "
          >
            Explorar NFTs
          </Link>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <p className="text-xs text-[var(--color-text-secondary)]">
        Carregando sua lista de interesse...
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Não foi possível carregar sua lista de interesse.
      </p>
    )
  }

  return (
    <section>
      <div>
        <h1 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
          Lista de interesse
        </h1>

        <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
          {favoriteIds.length}{' '}
          {favoriteIds.length ===
          1
            ? 'NFT salvo'
            : 'NFTs salvos'}
        </p>
      </div>

      <div
        className="
          mt-6
          grid
          gap-5
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        {nfts.map(
          (nft) => {
            const quantityInCart =
              getItemQuantity(
                nft.id,
              )

            const soldOut =
              nft.availableQuantity <=
              0

            const maxInCart =
              quantityInCart >=
              nft.availableQuantity

            return (
              <article
                key={
                  nft.id
                }
                className="
                  overflow-hidden
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                "
              >
                <Link
                  to="/nft/$nftId"
                  params={{
                    nftId:
                      nft.id,
                  }}
                >
                  <img
                    src={
                      nft.imageUrl
                    }
                    alt={
                      nft.name
                    }
                    className="
                      aspect-square
                      w-full
                      object-cover
                    "
                  />
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to="/nft/$nftId"
                        params={{
                          nftId:
                            nft.id,
                        }}
                        className="
                          block
                          truncate
                          text-xs
                          font-semibold
                          text-[var(--color-foreground-kurio)]
                          hover:text-[var(--color-text-accent)]
                        "
                      >
                        {
                          nft.name
                        }
                      </Link>

                      <p className="mt-1 truncate text-[10px] text-[var(--color-text-secondary)]">
                        {
                          nft.collection
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Remover dos favoritos"
                      onClick={() => {
                        removeFavorite(
                          nft.id,
                        )
                      }}
                      className="
                        shrink-0
                        text-[var(--color-text-accent)]
                        transition
                        hover:opacity-70
                      "
                    >
                      <Heart
                        size={17}
                        fill="currentColor"
                        strokeWidth={1.4}
                      />
                    </button>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase text-[var(--color-text-secondary)]">
                        Preço
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[var(--color-foreground-kurio)]">
                        {
                          nft.priceEth
                        }{' '}
                        ETH
                      </p>
                    </div>

                    <span className="text-[9px] uppercase text-[var(--color-text-secondary)]">
                      {
                        nft.network
                      }
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={
                      soldOut ||
                      maxInCart
                    }
                    onClick={() => {
                      addItem({
                        nft,
                        quantity:
                          1,
                      })
                    }}
                    className="
                      mt-4
                      flex
                      h-9
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-[var(--radius-control)]
                      bg-[var(--color-primary-kurio)]
                      px-3
                      text-[10px]
                      font-semibold
                      text-[var(--color-ink)]
                      transition
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ShoppingCart
                      size={13}
                    />

                    {soldOut
                      ? 'Esgotado'
                      : maxInCart
                        ? 'Máximo no carrinho'
                        : quantityInCart >
                            0
                          ? 'Adicionar mais'
                          : 'Adicionar ao carrinho'}
                  </button>
                </div>
              </article>
            )
          },
        )}
      </div>
    </section>
  )
}