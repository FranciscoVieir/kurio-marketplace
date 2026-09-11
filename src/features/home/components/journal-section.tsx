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
        h-[369px]
        w-[268px]
        overflow-hidden
        rounded-[8px]
        bg-[var(--color-surface-card)]
        
      "
    >
      <div
        className="
          h-[195px]
          w-[268px]
          overflow-hidden
          bg-card
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
          h-[174px]
          w-full
          flex-col
          gap-[8px]
          px-[16px]
          pb-[16px]
          pt-[12px]
        "
      >
        <p
          className="
            min-h-[32px]
            text-[12px]
            font-medium
            leading-[16px]
            text-[var(--color-text-secondary)]
          "
        >
          {article.meta}
        </p>

        <h3
          className="
            min-h-[42px]
            text-[16px]
            font-bold
            leading-[16px]
            text-[var(--color-foreground-kurio)]
          "
        >
          {article.title}
        </h3>

        <p
          className="
            min-h-[32px]
            text-[12px]
            font-medium
            leading-[16px]
            text-[var(--color-text-secondary)]
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
        pt-12
      "
    >
      <PageContainer>
        <div
          className="
            flex
            h-[476px]
            w-full
            flex-col
            gap-[40px]
          "
        >
          <header
            className="
              flex
              h-[67px]
              w-full
              flex-col
              gap-[12px]
              text-center
            "
          >
            <h2
              className="
                h-[37px]
                text-[28px]
                font-bold
                leading-[28px]
                text-[var(--color-foreground-kurio)]
              "
            >
              Diário da Cunhagem
            </h2>

            <p
              className="
                h-[18px]
                text-[14px]
                font-normal
                leading-[14px]
                text-[var(--color-text-secondary)]
              "
            >
              Histórias, guias e insights para colecionadores sobre o universo
              da propriedade digital.
            </p>
          </header>

          <div
            className="
              flex
              h-[369px]
              w-full
              items-start
              justify-center
              gap-[24px]
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