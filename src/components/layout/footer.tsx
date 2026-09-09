type FooterColumnProps = {
  title: string
  links: string[]
}

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div
      className="
        flex h-[174px] w-[178.67px]
        flex-col gap-[8px]
      "
    >
      <h3
        className="
          text-[18px] font-bold
          leading-[16px]
          text-[var(--color-foreground-kurio)]
        "
      >
        {title}
      </h3>

      <nav
        className="
          flex flex-col
          text-[14px] font-normal
          leading-[30px]
          text-[var(--color-foreground-kurio)]
        "
        aria-label={title}
      >
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="
              w-fit
              transition-opacity
              hover:opacity-70
            "
            onClick={(event) => {
              event.preventDefault()
            }}
          >
            {link}
          </a>
        ))}
      </nav>
    </div>
  )
}

function SocialAndWallets() {
  return (
    <div className="flex h-[174px] flex-1 flex-col">
      <h3
        className="
          text-[18px] font-bold
          leading-[16px]
          text-[var(--color-foreground-kurio)]
        "
      >
        Redes sociais
      </h3>

      <div className="mt-[12px] flex items-center gap-[8px]">
        <a
          href="#"
          aria-label="Facebook"
          className="
            flex h-[32px] w-[32px]
            items-center justify-center
            rounded-[4px]
            bg-[var(--color-primary-kurio)]
            text-[14px] font-bold
            text-[var(--color-ink)]
          "
          onClick={(event) => {
            event.preventDefault()
          }}
        >
          f
        </a>

        <a
          href="#"
          aria-label="Instagram"
          className="
            flex h-[32px] w-[32px]
            items-center justify-center
            rounded-[4px]
            bg-[var(--color-primary-kurio)]
            text-[14px] font-bold
            text-[var(--color-ink)]
          "
          onClick={(event) => {
            event.preventDefault()
          }}
        >
          ig
        </a>

        <a
          href="#"
          aria-label="X"
          className="
            flex h-[32px] w-[32px]
            items-center justify-center
            rounded-[4px]
            bg-[var(--color-primary-kurio)]
            text-[14px] font-bold
            text-[var(--color-ink)]
          "
          onClick={(event) => {
            event.preventDefault()
          }}
        >
          x
        </a>
      </div>

      <h3
        className="
          mt-[30px]
          text-[18px] font-bold
          leading-[16px]
          text-[var(--color-foreground-kurio)]
        "
      >
        Carteiras compatíveis
      </h3>

      <div className="mt-[12px] flex items-center gap-[8px]">
        <span
          className="
            flex h-[32px] items-center
            rounded-[4px]
            border border-border
            px-[8px]
            text-[10px] font-bold
            text-[var(--color-foreground-kurio)]
          "
        >
          METAMASK
        </span>

        <span
          className="
            flex h-[32px] items-center
            rounded-[4px]
            border border-border
            px-[8px]
            text-[10px] font-bold
            text-[var(--color-foreground-kurio)]
          "
        >
          WALLETCONNECT
        </span>

        <span
          className="
            flex h-[32px] items-center
            rounded-[4px]
            border border-border
            px-[8px]
            text-[10px] font-bold
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
    <footer className="mx-auto h-[360px] w-full max-w-[1200px]">
      <div
        className="
          flex h-[88px] w-full
          items-center
          bg-[var(--color-surface-dark,#38220F)]
          px-[32px]
        "
      >
        <div
          className="
            flex w-full
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
            <span
              className="
                text-[14px] font-bold
                leading-[14px]
                tracking-[0.1em]
                text-[var(--color-foreground-kurio)]
              "
            >
              KURIO
            </span>
          </div>

          <p
            className="
              w-[219px]
              shrink-0
              text-[14px] font-normal
              leading-[22px]
              text-[var(--color-foreground-kurio)]
            "
          >
            Feito para colecionadores e criadores.
          </p>

          <a
            href="mailto:contato@kurio.com"
            className="
              text-[14px] font-normal
              leading-[22px]
              text-[var(--color-foreground-kurio)]
              hover:opacity-70
            "
          >
            contato@kurio.com
          </a>

          <a
            href="tel:+5511999999999"
            className="
              ml-auto
              text-[14px] font-normal
              leading-[22px]
              text-[var(--color-foreground-kurio)]
              hover:opacity-70
            "
          >
            +55 11 99999-9999
          </a>
        </div>
      </div>

      <div
        className="
          h-[236px] w-full
          bg-background
          p-[32px]
        "
      >
        <div
          className="
            flex h-[174px] w-full
            gap-[124px]
          "
        >
          <FooterColumn
            title="Meu perfil"
            links={[
              'Meu perfil',
              'Minha coleção',
              'Atividade',
              'Configurações',
              'Sair',
            ]}
          />

          <FooterColumn
            title="Central de ajuda"
            links={[
              'Ajuda',
              'Como comprar',
              'Como vender',
              'Segurança',
              'Contato',
            ]}
          />

          <FooterColumn
            title="Coleções"
            links={[
              'Em alta',
              'Novos lançamentos',
              'Arte',
              'Colecionáveis',
              'Fotografia',
            ]}
          />

          <SocialAndWallets />
        </div>
      </div>

      <div
        className="
          flex h-[30px] w-full
          items-center justify-center
          text-center
          text-[14px] font-normal
          leading-[30px]
          text-[var(--color-foreground-kurio)]
        "
      >
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}