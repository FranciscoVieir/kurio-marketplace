import {
  useState,
} from 'react'

import type { Nft } from '@/features/nft/types/nft'

type NftDetailContentProps = {
  nft: Nft
}

type DetailTab =
  | 'details'
  | 'reviews'

type CollectorReview = {
  id: string
  name: string
  rating: number
  date: string
  comment: string
}

const collectorReviews: CollectorReview[] = [
  {
    id: 'review-1',
    name: 'Lucas M.',
    rating: 5,
    date: 'Há 2 dias',
    comment:
      'A arte ficou ainda melhor ao vivo. O processo de compra foi simples e a procedência do token ficou clara.',
  },
  {
    id: 'review-2',
    name: 'Marina C.',
    rating: 5,
    date: 'Há 5 dias',
    comment:
      'Gostei bastante da coleção e da apresentação dos detalhes do NFT. Ótimo item para coleção.',
  },
  {
    id: 'review-3',
    name: 'Rafael T.',
    rating: 4,
    date: 'Há 1 semana',
    comment:
      'Boa peça e informações bem organizadas. A edição limitada torna o colecionável mais interessante.',
  },
]

function formatNetwork(
  network: string,
) {
  switch (
    network.toLowerCase()
  ) {
    case 'ethereum':
      return 'Ethereum'

    case 'polygon':
      return 'Polygon'

    case 'solana':
      return 'Solana'

    default:
      return network
  }
}

export function NftDetailContent({
  nft,
}: NftDetailContentProps) {
  const [
    activeTab,
    setActiveTab,
  ] = useState<DetailTab>(
    'details',
  )

  return (
    <section
      id="collector-reviews"
      className="
        mt-[72px]
        scroll-mt-16
      "
    >
      <div
        role="tablist"
        aria-label="Informações do NFT"
        className="
          flex
          items-center
          gap-[28px]
          border-b
          border-[var(--color-border-kurio)]
        "
      >
        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab ===
            'details'
          }
          onClick={() =>
            setActiveTab(
              'details',
            )
          }
          className={`
            relative
            pb-[12px]
            text-[14px]
            leading-[18px]
            transition-colors
            ${
              activeTab ===
              'details'
                ? `
                  font-bold
                  text-[var(--color-text-accent)]
                `
                : `
                  font-normal
                  text-[var(--color-text-secondary)]
                  hover:text-[var(--color-foreground-kurio)]
                `
            }
          `}
        >
          Detalhes do NFT

          {activeTab ===
            'details' && (
            <span
              aria-hidden="true"
              className="
                absolute
                bottom-0
                left-0
                h-[2px]
                w-full
                bg-[var(--color-primary-kurio)]
              "
            />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab ===
            'reviews'
          }
          onClick={() =>
            setActiveTab(
              'reviews',
            )
          }
          className={`
            relative
            pb-[12px]
            text-[14px]
            leading-[18px]
            transition-colors
            ${
              activeTab ===
              'reviews'
                ? `
                  font-bold
                  text-[var(--color-text-accent)]
                `
                : `
                  font-normal
                  text-[var(--color-text-secondary)]
                  hover:text-[var(--color-foreground-kurio)]
                `
            }
          `}
        >
          Avaliações de colecionadores (19)

          {activeTab ===
            'reviews' && (
            <span
              aria-hidden="true"
              className="
                absolute
                bottom-0
                left-0
                h-[2px]
                w-full
                bg-[var(--color-primary-kurio)]
              "
            />
          )}
        </button>
      </div>

      {activeTab ===
        'details' && (
        <div
          role="tabpanel"
          className="
            max-w-[1080px]
            space-y-[16px]
            pt-[20px]
            text-[14px]
            font-normal
            leading-[22px]
            text-[var(--color-text-secondary)]
          "
        >
          <p>
            {nft.name} é uma
            obra digital da
            coleção{' '}
            <span
              className="
                text-[var(--color-foreground-kurio)]
              "
            >
              {nft.collection}
            </span>
            . Cada atributo fica
            armazenado nos
            metadados do token e
            verificado na rede{' '}
            <span
              className="
                text-[var(--color-foreground-kurio)]
              "
            >
              {formatNetwork(
                nft.network,
              )}
            </span>
            . A obra explora
            identidade, movimento
            e luz em um mundo
            digital sem fronteiras.
          </p>

          <p>
            A propriedade inclui a
            arte em alta resolução,
            um registro permanente
            de procedência na rede
            e acesso aos metadados
            associados ao token.
          </p>

          <div
            className="
              grid
              grid-cols-3
              gap-[16px]
              pt-[8px]
            "
          >
            <div
              className="
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                p-[16px]
              "
            >
              <p
                className="
                  text-[12px]
                  font-medium
                  uppercase
                  tracking-[0.05em]
                  text-[var(--color-text-secondary)]
                "
              >
                Rede
              </p>

              <p
                className="
                  mt-[6px]
                  text-[14px]
                  font-bold
                  text-[var(--color-foreground-kurio)]
                "
              >
                {formatNetwork(
                  nft.network,
                )}
              </p>
            </div>

            <div
              className="
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                p-[16px]
              "
            >
              <p
                className="
                  text-[12px]
                  font-medium
                  uppercase
                  tracking-[0.05em]
                  text-[var(--color-text-secondary)]
                "
              >
                Contrato
              </p>

              <p
                className="
                  mt-[6px]
                  text-[14px]
                  font-bold
                  text-[var(--color-foreground-kurio)]
                "
              >
                Verificado
              </p>
            </div>

            <div
              className="
                rounded-[6px]
                border
                border-[var(--color-border-kurio)]
                bg-[var(--color-surface-card)]
                p-[16px]
              "
            >
              <p
                className="
                  text-[12px]
                  font-medium
                  uppercase
                  tracking-[0.05em]
                  text-[var(--color-text-secondary)]
                "
              >
                Direitos
              </p>

              <p
                className="
                  mt-[6px]
                  text-[14px]
                  font-bold
                  text-[var(--color-foreground-kurio)]
                "
              >
                Propriedade digital
              </p>
            </div>
          </div>

          <div
            className="
              space-y-[12px]
              pt-[4px]
            "
          >
            <div>
              <p
                className="
                  font-bold
                  text-[var(--color-foreground-kurio)]
                "
              >
                Contrato
              </p>

              <p
                className="
                  mt-[4px]
                "
              >
                Contrato verificado.
                As vendas secundárias
                podem acontecer por
                mercados compatíveis.
              </p>
            </div>

            <div>
              <p
                className="
                  font-bold
                  text-[var(--color-foreground-kurio)]
                "
              >
                Direitos autorais
              </p>

              <p
                className="
                  mt-[4px]
                "
              >
                Contrato inteligente
                verificado e
                propriedade digital
                registrada.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab ===
        'reviews' && (
        <div
          role="tabpanel"
          className="
            pt-[20px]
          "
        >
          <div
            className="
              mb-[20px]
              flex
              items-end
              justify-between
            "
          >
            <div>
              <p
                className="
                  text-[24px]
                  font-bold
                  leading-[28px]
                  text-[var(--color-foreground-kurio)]
                "
              >
                4,9
              </p>

              <p
                className="
                  mt-[4px]
                  text-[13px]
                  text-[var(--color-primary-kurio)]
                "
                aria-label="Avaliação média de 4,9 de 5 estrelas"
              >
                ★★★★★
              </p>
            </div>

            <p
              className="
                text-[12px]
                leading-[18px]
                text-[var(--color-text-secondary)]
              "
            >
              19 avaliações de
              colecionadores
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-[16px]
            "
          >
            {collectorReviews.map(
              (
                review,
              ) => (
                <article
                  key={
                    review.id
                  }
                  className="
                    min-h-[180px]
                    rounded-[8px]
                    border
                    border-[var(--color-border-kurio)]
                    bg-[var(--color-surface-card)]
                    p-[18px]
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-[12px]
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[14px]
                          font-bold
                          text-[var(--color-foreground-kurio)]
                        "
                      >
                        {
                          review.name
                        }
                      </p>

                      <p
                        className="
                          mt-[5px]
                          text-[12px]
                          tracking-[0.05em]
                          text-[var(--color-primary-kurio)]
                        "
                        aria-label={`${review.rating} de 5 estrelas`}
                      >
                        {'★'.repeat(
                          review.rating,
                        )}
                        {'☆'.repeat(
                          5 -
                            review.rating,
                        )}
                      </p>
                    </div>

                    <span
                      className="
                        text-[11px]
                        text-[var(--color-text-secondary)]
                      "
                    >
                      {
                        review.date
                      }
                    </span>
                  </div>

                  <p
                    className="
                      mt-[14px]
                      text-[13px]
                      font-normal
                      leading-[20px]
                      text-[var(--color-text-secondary)]
                    "
                  >
                    {
                      review.comment
                    }
                  </p>
                </article>
              ),
            )}
          </div>

          <p
            className="
              mt-[16px]
              text-[11px]
              leading-[18px]
              text-[var(--color-text-secondary)]
            "
          >
            Avaliações simuladas para
            demonstração da interface.
          </p>
        </div>
      )}
    </section>
  )
}