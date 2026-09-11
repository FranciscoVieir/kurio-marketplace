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
      "
    >
      {/* MOBILE */}
      <div
        className="
          px-6
          pb-5
          lg:hidden
        "
      >
        <div
          className="
            relative
            min-h-[190px]
            w-full
            overflow-hidden
            rounded-[12px]
            bg-[var(--color-surface-card)]
            p-4
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                min-w-0
                flex-1
                flex-col
              "
            >
              <p
                className="
                  h-4
                  text-[12px]
                  font-medium
                  leading-4
                  tracking-[0.05em]
                  text-[var(--color-foreground-kurio)]
                "
              >
                Bem-vindo à Kurio
              </p>

              <h1
                className="
                  mt-1
                  text-[18px]
                  font-bold
                  leading-[29px]
                  text-[var(--text-primary-kurio)]
                "
              >
                SEJA DONO DA
                <br />
                CULTURA DIGITAL
              </h1>

              <p
                className="
                  mt-1
                  w-full
                  max-w-[188px]
                  text-[12px]
                  font-normal
                  leading-[18px]
                  text-[var(--color-text-secondary)]
                "
              >
                Descubra NFTs selecionados de criadores do mundo todo.
              </p>
            </div>

            <div
              className="
                mt-[5px]
                size-[124px]
                shrink-0
                overflow-hidden
                rounded-[16px]
                bg-[var(--color-ink)]
                min-[390px]:size-[132px]
                min-[414px]:size-[138px]
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

          <div
            className="
              mt-3
              flex
              min-h-4
              items-center
              justify-between
              gap-3
              pr-[124px]
              min-[390px]:pr-[132px]
              min-[414px]:pr-[138px]
            "
          >
            <button
              type="button"
              onClick={handleExplore}
              className="
                flex
                h-4
                shrink-0
                items-center
                gap-1.5
                text-[12px]
                font-bold
                leading-4
                text-[var(--color-primary-kurio)]
              "
            >
              EXPLORAR
              <span aria-hidden="true">→</span>
            </button>

            <div
              aria-label="Slide 1 de 3"
              className="
                flex
                shrink-0
                items-center
                gap-1
              "
            >
              <span
                aria-hidden="true"
                className="
                  size-[7px]
                  rounded-full
                  bg-[var(--color-primary-kurio)]
                "
              />

              <span
                aria-hidden="true"
                className="
                  size-[7px]
                  rounded-full
                  bg-[var(--color-primary-kurio)]/45
                "
              />

              <span
                aria-hidden="true"
                className="
                  size-[7px]
                  rounded-full
                  bg-[var(--color-primary-kurio)]/45
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP — PRESERVADO */}
      <div
        className="
          hidden
          pt-7
          pb-10
          lg:block
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
      </div>
    </section>
  )
}
