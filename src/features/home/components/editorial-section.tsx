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
        flex
        w-full
        flex-col
        overflow-hidden
        rounded-[12px]
        bg-[var(--color-surface-card)]
        lg:h-[250px]
        lg:w-[586px]
        lg:flex-row
        lg:rounded-[8px]
      "
    >
      <div
        className="
          relative
          h-[180px]
          w-full
          shrink-0
          overflow-hidden
          rounded-[16px]
          bg-card
          lg:-ml-[5px]
          lg:h-[250px]
          lg:w-[292px]
          lg:rounded-[18px]
        "
      >
        <img
          src={imageUrl}
          alt={imageAlt}
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
          min-w-0
          flex-1
          flex-col
          items-start
          px-4
          pt-4
          pb-5
          text-left
          lg:items-end
          lg:p-0
          lg:pr-[30px]
          lg:pt-[37px]
          lg:text-right
        "
      >
        <h2
          className="
            w-full
            text-[16px]
            font-bold
            leading-[22px]
            text-[var(--color-foreground-kurio)]
            lg:w-[206px]
            lg:text-[18px]
            lg:leading-[24px]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            w-full
            text-[12px]
            font-normal
            leading-[18px]
            text-[var(--color-text-secondary)]
            lg:mt-[9px]
            lg:w-[263px]
            lg:text-[14px]
            lg:leading-[24px]
          "
        >
          {description}
        </p>

        <Button
          type="button"
          className="
            mt-4
            h-[36px]
            w-[116px]
            rounded-[6px]
            bg-[var(--color-primary-kurio)]
            text-[14px]
            font-bold
            text-[var(--color-ink)]
            hover:bg-[var(--color-primary-kurio)]
            lg:mt-[25px]
            lg:h-[40px]
            lg:w-[140px]
            lg:text-[16px]
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
    <section
      className="
        bg-background
        pt-8
        lg:pt-16
      "
    >
      <PageContainer>
        <div
          className="
            flex
            w-full
            flex-col
            gap-4
            px-6
            lg:h-[250px]
            lg:flex-row
            lg:items-stretch
            lg:justify-between
            lg:gap-[28px]
            lg:px-0
          "
        >
          <EditorialCard
            imageUrl="/MenuMonkeys/monkey2.png"
            imageAlt="NFT da coleção Kurio Apes"
            title="Lançamentos gênesis de edição limitada"
            description="Colecione edições escassas diretamente dos criadores antes da revelação pública."
          />

          <EditorialCard
            imageUrl="/MenuMonkeys/monkey3.png"
            imageAlt="NFT de arte digital da Kurio"
            title="Arte digital selecionada e muito mais"
            description="Explore novos artistas, coleções verificadas e obras digitais que definem a cultura."
          />
        </div>
      </PageContainer>
    </section>
  )
}
