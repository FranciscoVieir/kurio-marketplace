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
    h-[202px]
    w-[264.67px]
    px-[16px]
    after:absolute
    after:right-0
    after:top-0
    after:bottom-0
    after:w-0.5
    after:bg-[var(--color-primary-kurio)]/45
    after:content-['']
      "

    >
      <div
        className="
          flex
          h-full
          w-full
          flex-col
          gap-[12px]
        "
      >
        <div
          className="
            flex
            h-[74px]
            w-[74px]
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[var(--color-primary-kurio)]
            text-[18px]
            font-bold
            text-[var(--color-ink)]
          "
          aria-hidden="true"
        >
          {benefit.initial}
        </div>

        <h3
          className="
            text-[17px]
            font-bold
            leading-[16px]
            text-[var(--color-foreground-kurio)]
          "
        >
          {benefit.title}
        </h3>

        <p
          className="
            max-w-[204px]
            text-[14px]
            font-normal
            leading-[22px]
            text-[var(--color-text-secondary)]
          "
        >
          {benefit.description}
        </p>
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
        h-[202px]
        w-[357px]
        px-[16px]
      "
      aria-labelledby="newsletter-title"
    >
      <div
        className="
          flex
          h-full
          flex-col
          gap-[12px]
        "
      >
        <div
          className="
            flex
            w-[325px]
            flex-col
            gap-[16px]
          "
        >
          <h3
            id="newsletter-title"
            className="
              text-[18px]
              font-bold
              leading-[16px]
              text-[var(--color-foreground-kurio)]
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
              w-[325px]
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
                px-[12px]
                text-[14px]
                font-normal
                leading-[16px]
                text-foreground
                outline-none
                placeholder:text-[var(--color-secondary-kurio)]
                focus:border-[var(--color-primary-kurio)]
              "
            />

            <button
              type="submit"
              className="
                h-[40px]
                w-[85px]
                shrink-0
                rounded-r-[6px]
                bg-[var(--color-primary-kurio)]
                px-[4px]
                py-[12px]
                text-[18px]
                font-bold
                leading-[16px]
                text-[var(--color-ink)]
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
              text-[13px]
              font-normal
              leading-[22px]
              text-[var(--color-text-accent)]
            "
          >
            Inscrição enviada com sucesso.
          </p>
        ) : (
          <p
            className="
              max-w-[325px]
              text-[13px]
              font-normal
              leading-[22px]
              text-[var(--color-text-secondary)]
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
        pt-10
      "
    >
      <PageContainer>
        <div
          className="
            h-[250px]
            w-full
            bg-[var(--color-surface-card)]
            p-[32px]
          "
        >
          <div
            className="
              flex
              h-[202px]
              w-full
              items-start
              justify-between
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
      </PageContainer>
    </section>
  )
}
