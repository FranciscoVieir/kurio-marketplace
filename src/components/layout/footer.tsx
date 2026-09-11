type FooterLink = {
  label: string
  href?: string
}

type FooterColumnProps = {
  title: string
  links: FooterLink[]
}

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-2
        lg:h-[174px]
        lg:w-[178.67px]
      "
    >
      <h3
        className="
          text-[16px]
          font-bold
          leading-[18px]
          text-[var(--color-foreground-kurio)]
          lg:text-[18px]
          lg:leading-[16px]
        "
      >
        {title}
      </h3>

      <nav
        className="
          flex
          flex-col
          text-[13px]
          font-normal
          leading-[26px]
          text-[var(--color-foreground-kurio)]
          lg:text-[14px]
          lg:leading-[30px]
        "
        aria-label={title}
      >
        {links.map(
          ({
            label,
            href,
          }) => {
            if (!href) {
              return (
                <span
                  key={label}
                  aria-disabled="true"
                  className="
                    w-fit
                    cursor-default
                    opacity-50
                  "
                >
                  {label}
                </span>
              )
            }

            return (
              <a
                key={label}
                href={href}
                className="
                  w-fit
                  transition-colors
                  hover:text-[var(--color-text-accent)]
                "
              >
                {label}
              </a>
            )
          },
        )}
      </nav>
    </div>
  )
}

function SocialAndWallets() {
  return (
    <div
      className="
        flex
        w-full
        flex-col
        lg:h-[174px]
        lg:flex-1
      "
    >
      <h3
        className="
          text-[16px]
          font-bold
          leading-[18px]
          text-[var(--color-foreground-kurio)]
          lg:text-[18px]
          lg:leading-[16px]
        "
      >
        Redes sociais
      </h3>

      <div
        className="
          mt-3
          flex
          items-center
          gap-2
        "
      >
        <span
          aria-label="Facebook"
          aria-disabled="true"
          className="
            flex
            size-8
            cursor-default
            items-center
            justify-center
            rounded-[4px]
            bg-[var(--color-primary-kurio)]
            text-[14px]
            font-bold
            text-[var(--color-ink)]
            opacity-70
          "
        >
          f
        </span>

        <span
          aria-label="Instagram"
          aria-disabled="true"
          className="
            flex
            size-8
            cursor-default
            items-center
            justify-center
            rounded-[4px]
            bg-[var(--color-primary-kurio)]
            text-[14px]
            font-bold
            text-[var(--color-ink)]
            opacity-70
          "
        >
          ig
        </span>

        <span
          aria-label="X"
          aria-disabled="true"
          className="
            flex
            size-8
            cursor-default
            items-center
            justify-center
            rounded-[4px]
            bg-[var(--color-primary-kurio)]
            text-[14px]
            font-bold
            text-[var(--color-ink)]
            opacity-70
          "
        >
          x
        </span>
      </div>

      <h3
        className="
          mt-6
          text-[16px]
          font-bold
          leading-[18px]
          text-[var(--color-foreground-kurio)]
          lg:mt-[30px]
          lg:text-[18px]
          lg:leading-[16px]
        "
      >
        Carteiras compatíveis
      </h3>

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          gap-2
        "
      >
        <span
          className="
            flex
            h-8
            items-center
            rounded-[4px]
            border
            border-border
            px-2
            text-[10px]
            font-bold
            text-[var(--color-foreground-kurio)]
          "
        >
          METAMASK
        </span>

        <span
          className="
            flex
            h-8
            items-center
            rounded-[4px]
            border
            border-border
            px-2
            text-[10px]
            font-bold
            text-[var(--color-foreground-kurio)]
          "
        >
          WALLETCONNECT
        </span>

        <span
          className="
            flex
            h-8
            items-center
            rounded-[4px]
            border
            border-border
            px-2
            text-[10px]
            font-bold
            text-[var(--color-foreground-kurio)]
          "
        >
          COINBASE
        </span>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer
      className="
        mx-auto
        w-full
        max-w-[1200px]
        pb-[120px]
        lg:h-[360px]
        lg:pb-0
      "
    >
      <div
        className="
          w-full
          bg-[var(--color-surface-dark,#38220F)]
          py-6
          lg:flex
          lg:h-[88px]
          lg:items-center
          lg:px-[32px]
          lg:py-0
        "
      >
        <div
          className="
            mx-auto
            flex
            w-[calc(100%-48px)]
            flex-col
            gap-3
            lg:mx-0
            lg:w-full
            lg:flex-row
            lg:items-center
            lg:gap-[92px]
          "
        >
          <div
            className="
              shrink-0
              lg:w-[210.67px]
              lg:py-[8px]
            "
          >
            <a
              href="/#home"
              className="
                text-[14px]
                font-bold
                leading-[14px]
                tracking-[0.1em]
                text-[var(--color-foreground-kurio)]
                transition-colors
                hover:text-[var(--color-text-accent)]
              "
            >
              KURIO
            </a>
          </div>

          <p
            className="
              text-[13px]
              font-normal
              leading-[20px]
              text-[var(--color-foreground-kurio)]
              lg:w-[219px]
              lg:shrink-0
              lg:text-[14px]
              lg:leading-[22px]
            "
          >
            Feito para colecionadores e criadores.
          </p>

          <a
            href="mailto:contato@kurio.com"
            className="
              text-[13px]
              font-normal
              leading-[20px]
              text-[var(--color-foreground-kurio)]
              transition-colors
              hover:text-[var(--color-text-accent)]
              lg:text-[14px]
              lg:leading-[22px]
            "
          >
            contato@kurio.com
          </a>

          <a
            href="tel:+5511999999999"
            className="
              text-[13px]
              font-normal
              leading-[20px]
              text-[var(--color-foreground-kurio)]
              transition-colors
              hover:text-[var(--color-text-accent)]
              lg:ml-auto
              lg:text-[14px]
              lg:leading-[22px]
            "
          >
            +55 11 99999-9999
          </a>
        </div>
      </div>

      <div
        className="
          w-full
          bg-background
          py-8
          lg:h-[236px]
          lg:p-[32px]
        "
      >
        <div
          className="
            mx-auto
            grid
            w-[calc(100%-48px)]
            grid-cols-2
            gap-x-6
            gap-y-8
            lg:mx-0
            lg:flex
            lg:h-[174px]
            lg:w-full
            lg:gap-[124px]
          "
        >
          <FooterColumn
            title="Meu perfil"
            links={[
              {
                label:
                  'Meu perfil',
                href:
                  '/profile',
              },
              {
                label:
                  'Minha coleção',
              },
              {
                label:
                  'Atividade',
              },
              {
                label:
                  'Configurações',
              },
              {
                label:
                  'Sair',
              },
            ]}
          />

          <FooterColumn
            title="Central de ajuda"
            links={[
              {
                label:
                  'Ajuda',
              },
              {
                label:
                  'Como comprar',
              },
              {
                label:
                  'Como vender',
              },
              {
                label:
                  'Segurança',
              },
              {
                label:
                  'Contato',
                href:
                  'mailto:contato@kurio.com',
              },
            ]}
          />

          <FooterColumn
            title="Coleções"
            links={[
              {
                label:
                  'Em alta',
                href:
                  '/?tab=trending&page=1#catalog',
              },
              {
                label:
                  'Novos lançamentos',
                href:
                  '/?tab=new&page=1#catalog',
              },
              {
                label:
                  'Arte',
                href:
                  '/?category=digital-art&page=1#catalog',
              },
              {
                label:
                  'Colecionáveis',
                href:
                  '/?category=collectibles&page=1#catalog',
              },
              {
                label:
                  'Fotografia',
                href:
                  '/?category=photography&page=1#catalog',
              },
            ]}
          />

          <SocialAndWallets />
        </div>
      </div>

      <div
        className="
          flex
          w-full
          items-center
          justify-center
          px-6
          py-3
          text-center
          text-[12px]
          font-normal
          leading-[18px]
          text-[var(--color-foreground-kurio)]
          lg:h-[30px]
          lg:px-0
          lg:py-0
          lg:text-[14px]
          lg:leading-[30px]
        "
      >
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}
