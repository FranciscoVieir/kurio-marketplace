import {
  Link,
} from '@tanstack/react-router'

import {
  Heart,
  ShoppingCart,
  TriangleAlert,
} from 'lucide-react'

import {
  Button,
} from '@/components/ui/button'

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
      <section
        className="
          w-full
          max-w-225

          max-md:mx-auto
          max-md:max-w-[366px]
        "
      >
        <div>
          <h1
            className="
              text-xl
              font-semibold
              leading-7
              text-[var(--color-foreground-kurio)]

              max-md:text-[20px]
              max-md:font-bold
              max-md:leading-[24px]
            "
          >
            Lista de interesse
          </h1>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-[var(--color-text-secondary)]

              max-md:mt-[6px]
              max-md:text-[13px]
              max-md:leading-[20px]
            "
          >
            NFTs que você salvou para acompanhar depois.
          </p>
        </div>

        <div
          className="
            mt-7
            flex
            min-h-80
            flex-col
            items-center
            justify-center
            rounded-lg
            border
            border-[var(--color-border-kurio)]
            bg-[var(--color-surface-card)]
            px-6
            py-10
            text-center

            max-md:mt-[24px]
            max-md:min-h-[280px]
            max-md:rounded-[14px]
            max-md:px-[20px]
            max-md:py-[32px]
          "
        >
          <div
            className="
              flex
              size-14
              items-center
              justify-center
              rounded-full
              border
              border-[rgba(210,138,76,0.24)]
              bg-[rgba(210,138,76,0.08)]

              max-md:size-[52px]
            "
          >
            <Heart
              size={24}
              strokeWidth={1.5}
              className="text-[var(--color-text-accent)]"
            />
          </div>

          <h2
            className="
              mt-5
              text-base
              font-semibold
              text-[var(--color-foreground-kurio)]

              max-md:mt-[18px]
              max-md:text-[16px]
              max-md:font-bold
              max-md:leading-[22px]
            "
          >
            Sua lista está vazia
          </h2>

          <p
            className="
              mt-2
              max-w-sm
              text-xs
              leading-5
              text-[var(--color-text-secondary)]

              max-md:max-w-[280px]
              max-md:text-[13px]
              max-md:leading-[20px]
            "
          >
            Favorite NFTs no marketplace para encontrá-los rapidamente aqui.
          </p>

          <Link
            to="/"
            hash="catalog"
            className="
              mt-6
              inline-flex
              h-10
              items-center
              justify-center
              rounded-md
              bg-[var(--color-primary-kurio)]
              px-5
              text-xs
              font-semibold
              text-[var(--color-ink)]
              transition
              hover:opacity-90
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary-kurio)]/30

              max-md:mt-[22px]
              max-md:h-[48px]
              max-md:w-full
              max-md:max-w-[260px]
              max-md:rounded-[24px]
              max-md:text-[14px]
              max-md:font-bold
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
      <section
        aria-label="Carregando lista de interesse"
        className="
          w-full
          max-w-225

          max-md:mx-auto
          max-md:max-w-[366px]
        "
      >
        <div
          className="
            h-7
            w-48
            animate-pulse
            rounded-md
            bg-[var(--color-surface-card)]

            max-md:h-[24px]
            max-md:w-[180px]
            max-md:rounded-[8px]
          "
        />

        <div
          className="
            mt-2
            h-4
            w-64
            animate-pulse
            rounded-sm
            bg-[var(--color-surface-card)]

            max-md:mt-[8px]
            max-md:w-[220px]
            max-md:max-w-full
          "
        />

        <div
          className="
            mt-7
            grid
            gap-5
            sm:grid-cols-2
            xl:grid-cols-3

            max-md:mt-[24px]
            max-md:grid-cols-1
            max-md:gap-[14px]
          "
        >
          {Array.from({
            length: 6,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-lg
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]

                  max-md:rounded-[14px]
                "
              >
                <div className="aspect-square w-full animate-pulse bg-[var(--color-border-kurio)]" />

                <div
                  className="
                    space-y-4
                    p-4

                    max-md:space-y-[14px]
                    max-md:p-[14px]
                  "
                >
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                    <div className="h-3 w-1/2 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-3 w-12 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                      <div className="h-4 w-20 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                    </div>

                    <div className="h-3 w-16 animate-pulse rounded-sm bg-[var(--color-border-kurio)]" />
                  </div>

                  <div className="h-9 w-full animate-pulse rounded-md bg-[var(--color-border-kurio)]" />
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section
        className="
          w-full
          max-w-225

          max-md:mx-auto
          max-md:max-w-[366px]
        "
      >
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-red-400/20
            bg-red-400/5
            px-5
            py-4

            max-md:rounded-[14px]
            max-md:px-[16px]
            max-md:py-[14px]
          "
        >
          <div className="flex items-start gap-3">
            <TriangleAlert
              size={17}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--color-foreground-kurio)]

                  max-md:text-[14px]
                  max-md:leading-[20px]
                "
              >
                Não foi possível carregar sua lista de interesse
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-[var(--color-text-secondary)]

                  max-md:text-[13px]
                  max-md:leading-[20px]
                "
              >
                Tente novamente em alguns instantes.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="
        w-full
        max-w-225

        max-md:mx-auto
        max-md:max-w-[366px]
      "
    >
      <div>
        <h1
          className="
            text-xl
            font-semibold
            leading-7
            text-[var(--color-foreground-kurio)]

            max-md:text-[20px]
            max-md:font-bold
            max-md:leading-[24px]
          "
        >
          Lista de interesse
        </h1>

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-[var(--color-text-secondary)]

            max-md:mt-[6px]
            max-md:text-[13px]
            max-md:leading-[20px]
          "
        >
          {favoriteIds.length}{' '}
          {favoriteIds.length ===
          1
            ? 'NFT salvo'
            : 'NFTs salvos'}
        </p>
      </div>

      <div
        className="
          mt-7
          grid
          gap-5
          sm:grid-cols-2
          xl:grid-cols-3

          max-md:mt-[24px]
          max-md:grid-cols-1
          max-md:gap-[14px]
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
                  group
                  overflow-hidden
                  rounded-lg
                  border
                  border-[var(--color-border-kurio)]
                  bg-[var(--color-surface-card)]
                  transition
                  hover:border-[rgba(210,138,76,0.28)]

                  max-md:rounded-[14px]
                "
              >
                <div className="relative overflow-hidden">
                  <Link
                    to="/nft/$nftId"
                    params={{
                      nftId:
                        nft.id,
                    }}
                    className="
                      block
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-[var(--color-primary-kurio)]/30
                    "
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
                        transition
                        duration-300
                        group-hover:scale-[1.02]
                      "
                    />
                  </Link>

                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Remover ${nft.name} dos favoritos`}
                    title="Remover dos favoritos"
                    onClick={() => {
                      removeFavorite(
                        nft.id,
                      )
                    }}
                    className="
                      absolute
                      right-3
                      top-3
                      size-9
                      rounded-full
                      border
                      border-[rgba(245,241,235,0.14)]
                      bg-[rgba(20,13,10,0.72)]
                      p-0
                      text-[var(--color-text-accent)]
                      backdrop-blur-sm
                      hover:bg-[rgba(20,13,10,0.9)]
                      hover:text-[var(--color-text-accent)]

                      max-md:right-[12px]
                      max-md:top-[12px]
                      max-md:size-[36px]
                    "
                  >
                    <Heart
                      size={16}
                      fill="currentColor"
                      strokeWidth={1.5}
                    />
                  </Button>
                </div>

                <div
                  className="
                    p-4

                    max-md:p-[14px]
                  "
                >
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
                        text-sm
                        font-semibold
                        leading-5
                        text-[var(--color-foreground-kurio)]
                        transition
                        hover:text-[var(--color-text-accent)]
                        focus-visible:outline-none
                        focus-visible:ring-1
                        focus-visible:ring-[var(--color-primary-kurio)]

                        max-md:text-[15px]
                        max-md:font-bold
                        max-md:leading-[20px]
                      "
                    >
                      {
                        nft.name
                      }
                    </Link>

                    <p
                      className="
                        mt-1
                        truncate
                        text-[11px]
                        leading-4
                        text-[var(--color-text-secondary)]

                        max-md:text-[12px]
                        max-md:leading-[16px]
                      "
                    >
                      {
                        nft.collection
                      }
                    </p>
                  </div>

                  <div
                    className="
                      mt-5
                      flex
                      items-end
                      justify-between
                      gap-3

                      max-md:mt-[16px]
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-[0.08em]
                          text-[var(--color-text-secondary)]

                          max-md:text-[10px]
                          max-md:leading-[14px]
                        "
                      >
                        Preço
                      </p>

                      <p
                        className="
                          mt-1
                          text-base
                          font-semibold
                          leading-6
                          text-[var(--color-text-accent)]

                          max-md:text-[16px]
                          max-md:font-bold
                          max-md:leading-[20px]
                        "
                      >
                        {
                          nft.priceEth
                        }{' '}
                        ETH
                      </p>
                    </div>

                    <span
                      className="
                        rounded-md
                        border
                        border-[var(--color-border-kurio)]
                        px-2
                        py-1
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.06em]
                        text-[var(--color-text-secondary)]

                        max-md:rounded-[12px]
                        max-md:px-[9px]
                        max-md:py-[5px]
                        max-md:text-[10px]
                      "
                    >
                      {
                        nft.network
                      }
                    </span>
                  </div>

                  <Button
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
                      h-10
                      w-full
                      rounded-md
                      bg-[var(--color-primary-kurio)]
                      px-4
                      text-xs
                      font-semibold
                      text-[var(--color-ink)]
                      hover:bg-[var(--color-primary-kurio)]
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-40

                      max-md:mt-[14px]
                      max-md:h-[48px]
                      max-md:rounded-[24px]
                      max-md:text-[14px]
                      max-md:font-bold
                    "
                  >
                    <ShoppingCart
                      size={14}
                    />

                    {soldOut
                      ? 'Esgotado'
                      : maxInCart
                        ? 'Máximo no carrinho'
                        : quantityInCart >
                            0
                          ? 'Adicionar mais'
                          : 'Adicionar ao carrinho'}
                  </Button>
                </div>
              </article>
            )
          },
        )}
      </div>
    </section>
  )
}
