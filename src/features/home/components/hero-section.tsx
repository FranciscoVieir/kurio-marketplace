import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'

export function HeroSection() {
  return (
    <section className="bg-[var(--color-ink)]">
      <PageContainer>
        <div
          className="
            flex h-[450px] items-center
            justify-between
            pl-10
          "
        >
          <div className="flex w-[600px] flex-col gap-8">
            <div>
              <p
                className="
                  text-[14px] font-medium
                  leading-[16px] tracking-[0.1em]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Bem-vindo à Kurio
              </p>

              <h1
                className="
                  mt-4
                  text-[43px] font-bold
                  leading-[70px]
                  text-[var(--text-primary-kurio)]
                "
              >
                SEJA DONO DO FUTURO
                <br />
                DA ARTE DIGITAL
              </h1>
            </div>

            <p
              className="
                max-w-[557px]
                text-[14px] font-normal
                leading-[24px]
                text-[var(--color-text-secondary)]
              "
            >
              Descubra NFTs selecionados de criadores emergentes e
              consagrados. Colecione arte digital rara, apoie artistas e
              tenha uma parte da cultura da internet.
            </p>

            <Button
              className="
                h-[40px] w-[140px]
                rounded-[6px]
                bg-[var(--color-primary-kurio)]
                px-7 py-[10px]
                text-[16px] font-bold leading-[20px]
                text-[var(--color-ink)]
                hover:bg-[var(--color-primary-kurio)]
              "
            >
              EXPLORAR
            </Button>

            <div
              aria-label="Slide 1 de 3"
              className="flex h-2 w-10 items-center gap-1"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-kurio)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-kurio)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-kurio)]" />
            </div>
          </div>

          <div
            className="
              h-[450px] w-[450px]
              overflow-hidden rounded-[24px]
              bg-[var(--color-surface-card)]
            "
          >
            <div
              className="
                flex h-full w-full
                items-center justify-center
                text-[14px]
                text-[var(--color-text-secondary)]
              "
            >
              Hero NFT image
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}