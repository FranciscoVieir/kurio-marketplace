import { PageContainer } from '@/components/layout/page-container'

type JournalArticle = {
  id: string
  imageUrl: string
  imageAlt: string
  meta: string
  title: string
  description: string
}

const journalArticles: JournalArticle[] = [
  {
    id: 'ownership-guide',
    imageUrl:
      '/MenuMonkeys/heroSection/heroMonkey.png',
    imageAlt:
      'Arte digital da coleção Kurio',
    meta:
      '12 de setembro | Leitura de 6 min',
    title:
      'Como funciona a propriedade de NFTs',
    description:
      'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    id: 'artists-to-follow',
    imageUrl:
      '/MenuMonkeys/monkey1.png',
    imageAlt:
      'Arte NFT de um criador da Kurio',
    meta:
      '13 de setembro | Leitura de 2 min',
    title:
      '10 artistas digitais para acompanhar',
    description:
      'Conheça criadores que moldam a cultura digital.',
  },
  {
    id: 'rarity-and-provenance',
    imageUrl:
      '/MenuMonkeys/monkey2.png',
    imageAlt:
      'NFT da coleção Kurio',
    meta:
      '15 de setembro | Leitura de 3 min',
    title:
      'Raridade, atributos e procedência',
    description:
      'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    id: 'protect-wallet',
    imageUrl:
      '/MenuMonkeys/monkey3.png',
    imageAlt:
      'Arte digital NFT da Kurio',
    meta:
      '15 de setembro | Leitura de 2 min',
    title:
      'Como proteger sua carteira',
    description:
      'Proteja sua carteira, seus ativos e sua identidade.',
  },
]

function JournalCard({
  article,
}: {
  article: JournalArticle
}) {
  return (
    <article
      className="
        w-full
        overflow-hidden
        rounded-[12px]
        bg-[var(--color-surface-card)]
        lg:h-[369px]
        lg:w-[268px]
        lg:rounded-[8px]
      "
    >
      <div
        className="
          aspect-[1.375]
          w-full
          overflow-hidden
          bg-card
          lg:h-[195px]
          lg:w-[268px]
        "
      >
        <img
          src={article.imageUrl}
          alt={article.imageAlt}
          className="
            h-full
            w-full
            object-cover
          "
        />
      </div>

      <div
        className="
          flex
          min-h-[150px]
          w-full
          flex-col
          gap-2
          px-4
          pt-3
          pb-4
          lg:h-[174px]
          lg:min-h-0
        "
      >
        <p
          className="
            text-[11px]
            font-medium
            leading-4
            text-[var(--color-text-secondary)]
            lg:min-h-[32px]
            lg:text-[12px]
          "
        >
          {article.meta}
        </p>

        <h3
          className="
            text-[15px]
            font-bold
            leading-[19px]
            text-[var(--color-foreground-kurio)]
            lg:min-h-[42px]
            lg:text-[16px]
            lg:leading-[16px]
          "
        >
          {article.title}
        </h3>

        <p
          className="
            text-[12px]
            font-medium
            leading-[17px]
            text-[var(--color-text-secondary)]
            lg:min-h-[32px]
            lg:leading-[16px]
          "
        >
          {article.description}
        </p>

        <button
          type="button"
          aria-disabled="true"
          className="
            mt-auto
            w-fit
            cursor-default
            text-[12px]
            font-bold
            leading-[14px]
            text-[var(--color-text-accent)]
            opacity-70
          "
        >
          Ler mais →
        </button>
      </div>
    </article>
  )
}

export function JournalSection() {
  return (
    <section
      id="learn"
      className="
        scroll-mt-16
        bg-background
        pt-8
        lg:pt-12
      "
    >
      <PageContainer>
        <div
          className="
            flex
            w-full
            flex-col
            gap-6
            px-6
            lg:h-[476px]
            lg:gap-[40px]
            lg:px-0
          "
        >
          <header
            className="
              flex
              w-full
              flex-col
              gap-2
              text-left
              lg:h-[67px]
              lg:gap-[12px]
              lg:text-center
            "
          >
            <h2
              className="
                text-[22px]
                font-bold
                leading-[28px]
                text-[var(--color-foreground-kurio)]
                lg:h-[37px]
                lg:text-[28px]
              "
            >
              Diário da Cunhagem
            </h2>

            <p
              className="
                max-w-[330px]
                text-[12px]
                font-normal
                leading-[18px]
                text-[var(--color-text-secondary)]
                lg:h-[18px]
                lg:max-w-none
                lg:text-[14px]
                lg:leading-[14px]
              "
            >
              Histórias, guias e insights para colecionadores sobre o universo
              da propriedade digital.
            </p>
          </header>

          <div
            className="
              grid
              w-full
              grid-cols-2
              gap-4
              lg:flex
              lg:h-[369px]
              lg:items-start
              lg:justify-center
              lg:gap-[24px]
            "
          >
            {journalArticles.map(
              (article) => (
                <JournalCard
                  key={
                    article.id
                  }
                  article={
                    article
                  }
                />
              ),
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
