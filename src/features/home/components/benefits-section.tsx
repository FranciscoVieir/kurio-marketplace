import {
  useState,
} from 'react'

import { PageContainer } from '@/components/layout/page-container'

type Benefit = {
  id: string
  initial: string
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    id: 'wallet-security',
    initial: 'W',
    title: 'Segurança da carteira',
    description:
      'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    id: 'featured-creators',
    initial: 'C',
    title: 'Criadores em destaque',
    description:
      'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    id: 'launch-alerts',
    initial: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

function BenefitItem({
  benefit,
}: {
  benefit: Benefit
}) {
  return (
    <article
      className="
        relative
        w-full
        py-5
        after:absolute
        after:right-0
        after:bottom-0
        after:left-0
        after:h-px
        after:bg-[var(--color-primary-kurio)]/45
        after:content-['']
        last:after:hidden
        lg:h-[202px]
        lg:w-[264.67px]
        lg:px-[16px]
        lg:py-0
        lg:after:top-0
        lg:after:right-0
        lg:after:bottom-0
        lg:after:left-auto
        lg:after:h-auto
        lg:after:w-0.5
        lg:last:after:block
      "
    >
      <div
        className="
          flex
          h-full
          w-full
          items-start
          gap-4
          lg:flex-col
          lg:gap-[12px]
        "
      >
        <div
          className="
            flex
            size-[54px]
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[var(--color-primary-kurio)]
            text-[16px]
            font-bold
            text-[var(--color-ink)]
            lg:h-[74px]
            lg:w-[74px]
            lg:text-[18px]
          "
          aria-hidden="true"
        >
          {benefit.initial}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <h3
            className="
              text-[15px]
              font-bold
              leading-[18px]
              text-[var(--color-foreground-kurio)]
              lg:text-[17px]
              lg:leading-[16px]
            "
          >
            {benefit.title}
          </h3>

          <p
            className="
              mt-2
              max-w-[250px]
              text-[12px]
              font-normal
              leading-[18px]
              text-[var(--color-text-secondary)]
              lg:mt-3
              lg:max-w-[204px]
              lg:text-[14px]
              lg:leading-[22px]
            "
          >
            {benefit.description}
          </p>
        </div>
      </div>
    </article>
  )
}

function Newsletter() {
  const [
    submitted,
    setSubmitted,
  ] = useState(false)

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setSubmitted(true)
  }

  return (
    <section
      className="
        w-full
        pt-5
        lg:h-[202px]
        lg:w-[357px]
        lg:px-[16px]
        lg:pt-0
      "
      aria-labelledby="newsletter-title"
    >
      <div
        className="
          flex
          h-full
          flex-col
          gap-3
        "
      >
        <div
          className="
            flex
            w-full
            flex-col
            gap-4
            lg:w-[325px]
          "
        >
          <h3
            id="newsletter-title"
            className="
              text-[16px]
              font-bold
              leading-[20px]
              text-[var(--color-foreground-kurio)]
              lg:text-[18px]
              lg:leading-[16px]
            "
          >
            Antecipe-se ao próximo
            <br />
            lançamento
          </h3>

          <form
            className="
              flex
              h-[40px]
              w-full
              lg:w-[325px]
            "
            onSubmit={
              handleSubmit
            }
          >
            <label
              htmlFor="newsletter-email"
              className="sr-only"
            >
              Seu e-mail
            </label>

            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="digite seu e-mail..."
              className="
                min-w-0
                flex-1
                border
                border-r-0
                border-border
                bg-[var(--color-surface-dark,#38220F)]
                px-3
                text-[13px]
                font-normal
                leading-4
                text-foreground
                outline-none
                placeholder:text-[var(--color-secondary-kurio)]
                focus:border-[var(--color-primary-kurio)]
                lg:text-[14px]
              "
            />

            <button
              type="submit"
              className="
                h-[40px]
                w-[78px]
                shrink-0
                rounded-r-[6px]
                bg-[var(--color-primary-kurio)]
                px-1
                py-3
                text-[16px]
                font-bold
                leading-4
                text-[var(--color-ink)]
                lg:w-[85px]
                lg:text-[18px]
              "
            >
              Enviar
            </button>
          </form>
        </div>

        {submitted ? (
          <p
            role="status"
            className="
              max-w-[325px]
              text-[12px]
              font-normal
              leading-[18px]
              text-[var(--color-text-accent)]
              lg:text-[13px]
              lg:leading-[22px]
            "
          >
            Inscrição enviada com sucesso.
          </p>
        ) : (
          <p
            className="
              max-w-[325px]
              text-[12px]
              font-normal
              leading-[18px]
              text-[var(--color-text-secondary)]
              lg:text-[13px]
              lg:leading-[22px]
            "
          >
            Receba lançamentos selecionados, histórias de criadores e novidades
            do mercado.
          </p>
        )}
      </div>
    </section>
  )
}

export function BenefitsSection() {
  return (
    <section
      id="creators"
      className="
        scroll-mt-16
        bg-background
        pt-8
        lg:pt-10
      "
    >
      <PageContainer>
        <div
          className="
            px-6
            lg:px-0
          "
        >
          <div
            className="
              w-full
              rounded-[12px]
              bg-[var(--color-surface-card)]
              px-4
              py-5
              lg:h-[250px]
              lg:rounded-none
              lg:p-[32px]
            "
          >
            <div
              className="
                flex
                w-full
                flex-col
                lg:h-[202px]
                lg:flex-row
                lg:items-start
                lg:justify-between
              "
            >
              {benefits.map(
                (benefit) => (
                  <BenefitItem
                    key={
                      benefit.id
                    }
                    benefit={
                      benefit
                    }
                  />
                ),
              )}

              <Newsletter />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
