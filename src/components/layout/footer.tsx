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
        h-[174px]
        w-[178.67px]
        flex-col
        gap-[8px]
      "
    >
      <h3
        className="
          text-[18px]
          font-bold
          leading-[16px]
          text-[var(--color-foreground-kurio)]
        "
      >
        {title}
      </h3>

      <nav
        className="
          flex
          flex-col
          text-[14px]
          font-normal
          leading-[30px]
          text-[var(--color-foreground-kurio)]
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
        h-[174px]
        flex-1
        flex-col
      "
    >
      <h3
        className="
          text-[18px]
          font-bold
          leading-[16px]
          text-[var(--color-foreground-kurio)]
        "
      >
        Redes sociais
      </h3>

      <div
        className="
          mt-[12px]
          flex
          items-center
          gap-[8px]
        "
      >
        <span
          aria-label="Facebook"
          aria-disabled="true"
          className="
            flex
            h-[32px]
            w-[32px]
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
            h-[32px]
            w-[32px]
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
            h-[32px]
            w-[32px]
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
          mt-[30px]
          text-[18px]
          font-bold
          leading-[16px]
          text-[var(--color-foreground-kurio)]
        "
      >
        Carteiras compatíveis
      </h3>

      <div
        className="
          mt-[12px]
          flex
          items-center
          gap-[8px]
        "
      >
        <span
          className="
            flex
            h-[32px]
            items-center
            rounded-[4px]
            border
            border-border
            px-[8px]
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
            h-[32px]
            items-center
            rounded-[4px]
            border
            border-border
            px-[8px]
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
            h-[32px]
            items-center
            rounded-[4px]
            border
            border-border
            px-[8px]
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
        h-[360px]
        w-full
        max-w-[1200px]
      "
    >
      <div
        className="
          flex
          h-[88px]
          w-full
          items-center
          bg-[var(--color-surface-dark,#38220F)]
          px-[32px]
        "
      >
        <div
          className="
            flex
            w-full
            items-center
            gap-[92px]
          "
        >
          <div
            className="
              w-[210.67px]
              shrink-0
              py-[8px]
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
              w-[219px]
              shrink-0
              text-[14px]
              font-normal
              leading-[22px]
              text-[var(--color-foreground-kurio)]
            "
          >
            Feito para colecionadores e criadores.
          </p>

          <a
            href="mailto:contato@kurio.com"
            className="
              text-[14px]
              font-normal
              leading-[22px]
              text-[var(--color-foreground-kurio)]
              transition-colors
              hover:text-[var(--color-text-accent)]
            "
          >
            contato@kurio.com
          </a>

          <a
            href="tel:+5511999999999"
            className="
              ml-auto
              text-[14px]
              font-normal
              leading-[22px]
              text-[var(--color-foreground-kurio)]
              transition-colors
              hover:text-[var(--color-text-accent)]
            "
          >
            +55 11 99999-9999
          </a>
        </div>
      </div>

      <div
        className="
          h-[236px]
          w-full
          bg-background
          p-[32px]
        "
      >
        <div
          className="
            flex
            h-[174px]
            w-full
            gap-[124px]
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
          h-[30px]
          w-full
          items-center
          justify-center
          text-center
          text-[14px]
          font-normal
          leading-[30px]
          text-[var(--color-foreground-kurio)]
        "
      >
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}