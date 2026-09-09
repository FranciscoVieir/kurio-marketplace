import { PageContainer } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'

type EditorialCardProps = {
  imageUrl: string
  imageAlt: string
  title: string
  description: string
}

function EditorialCard({
  imageUrl,
  imageAlt,
  title,
  description,
}: EditorialCardProps) {
  return (
    <article
      className="
        flex h-[250px] w-[586px]
        overflow-hidden rounded-[8px]
        bg-[var(--color-surface-card)]
      "
    >
      <div
        className="
          relative -ml-[5px]
          h-[250px] w-[292px]
          shrink-0 overflow-hidden
          rounded-[18px]
          bg-card
        "
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
      </div>

      <div
        className="
          flex min-w-0 flex-1
          flex-col items-end
          pr-[30px] pt-[37px]
          text-right
        "
      >
        <h2
          className="
            w-[206px]
            text-[18px] font-bold
            leading-[24px]
            text-[var(--color-foreground-kurio)]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-[9px] w-[263px]
            text-[14px] font-normal
            leading-[24px]
            text-[var(--color-text-secondary)]
          "
        >
          {description}
        </p>

        <Button
          type="button"
          className="
            mt-[25px]
            h-[40px] w-[140px]
            rounded-[6px]
            bg-[var(--color-primary-kurio)]
            text-[16px] font-bold
            text-[var(--color-ink)]
            hover:bg-[var(--color-primary-kurio)]
          "
          onClick={() => {
            document
              .getElementById('catalog')
              ?.scrollIntoView({
                behavior: 'smooth',
              })
          }}
        >
          Explorar →
        </Button>
      </div>
    </article>
  )
}

export function EditorialSection() {
  return (
    <section className="bg-background">
      <PageContainer>
        <div
          className="
            flex h-[250px] w-full
            items-stretch justify-between
            gap-[28px]
          "
        >
          <EditorialCard
            imageUrl="/images/emerald-ape.png"
            imageAlt="NFT da coleção Kurio Apes"
            title="Lançamentos gênesis de edição limitada"
            description="Colecione edições escassas diretamente dos criadores antes da revelação pública."
          />

          <EditorialCard
            imageUrl="/images/ivory-baron.png"
            imageAlt="NFT de arte digital da Kurio"
            title="Arte digital selecionada e muito mais"
            description="Explore novos artistas, coleções verificadas e obras digitais que definem a cultura."
          />
        </div>
      </PageContainer>
    </section>
  )
}