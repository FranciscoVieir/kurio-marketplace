import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'

export function HeroSection() {
  function handleExplore() {
    const catalog =
      document.getElementById(
        'catalog',
      )

    catalog?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    if (catalog) {
      const url =
        new URL(
          window.location.href,
        )

      url.hash = 'catalog'

      window.history.replaceState(
        window.history.state,
        '',
        url,
      )
    }
  }

  return (
    <section
      id="home"
      className="
        relative
        scroll-mt-16
        bg-[var(--color-ink)]
        pt-7
        pb-10
      "
    >
      <PageContainer>
        <div
          className="
            flex
            h-112.5
            items-center
            justify-between
            pl-10
          "
        >
          <div
            className="
              flex
              w-150
              flex-col
              gap-8
            "
          >
            <div>
              <p
                className="
                  text-[14px]
                  font-medium
                  leading-4
                  tracking-[0.1em]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Bem-vindo à Kurio
              </p>

              <h1
                className="
                  mt-4
                  text-[43px]
                  font-bold
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
                text-[14px]
                font-normal
                leading-6
                text-[var(--color-text-secondary)]
              "
            >
              Descubra NFTs selecionados de criadores emergentes e
              consagrados. Colecione arte digital rara, apoie artistas e
              tenha uma parte da cultura da internet.
            </p>

            <Button
              type="button"
              onClick={handleExplore}
              className="
                h-10
                w-35
                rounded-md
                bg-[var(--color-primary-kurio)]
                px-7
                py-2.5
                text-[16px]
                font-bold
                leading-5
                text-[var(--color-ink)]
                hover:bg-[var(--color-primary-kurio)]
              "
            >
              EXPLORAR
            </Button>
          </div>

          <div
            className="
              h-112.5
              w-112.5
              overflow-hidden
              rounded-3xl
              bg-[var(--color-surface-card)]
            "
          >
            <img
              src="/MenuMonkeys/heroSection/heroMonkey.png"
              alt="NFT em destaque da Kurio"
              className="
                h-full
                w-full
                object-cover
              "
            />
          </div>
        </div>
      </PageContainer>

      <div
        aria-label="Slide 1 de 3"
        className="
          absolute
          bottom-4
          left-1/2
          flex
          -translate-x-1/2
          items-center
          justify-center
          gap-1.5
        "
      >
        <span
          aria-hidden="true"
          className="
            h-2
            w-2
            rounded-full
            bg-[var(--color-primary-kurio)]
          "
        />

        <span
          aria-hidden="true"
          className="
            h-2
            w-2
            rounded-full
            bg-[var(--color-primary-kurio)]/45
          "
        />

        <span
          aria-hidden="true"
          className="
            h-2
            w-2
            rounded-full
            bg-[var(--color-primary-kurio)]/45
          "
        />
      </div>
    </section>
  )
}
