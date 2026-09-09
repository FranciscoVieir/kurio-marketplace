import type { Nft } from '@/features/nft/types/nft'

type NftDetailContentProps = {
  nft: Nft
}

export function NftDetailContent({
  nft,
}: NftDetailContentProps) {
  return (
    <section className="mt-[72px]">
      <div
        className="
          flex items-center gap-[28px]
          border-b border-border
        "
      >
        <button
          type="button"
          className="
            border-b-2
            border-[var(--color-primary-kurio)]
            pb-[10px]
            text-[13px] font-bold
            text-[var(--color-text-accent)]
          "
        >
          Detalhes do NFT
        </button>

        <button
          type="button"
          className="
            pb-[10px]
            text-[13px] font-normal
            text-muted-foreground
          "
        >
          Avaliações de colecionadores (19)
        </button>
      </div>

      <div
        className="
          max-w-[1080px]
          space-y-[12px]
          pt-[16px]
          text-[12px]
          leading-[20px]
          text-[var(--color-text-secondary)]
        "
      >
        <p>
          {nft.name} é uma obra digital da coleção {nft.collection}.
          Cada atributo fica armazenado nos metadados do token e
          verificado na rede {nft.network}. A obra explora identidade,
          movimento e luz em um mundo digital sem fronteiras.
        </p>

        <p>
          A propriedade inclui a arte em alta resolução, um registro
          permanente de procedência na rede e acesso aos metadados
          associados ao token.
        </p>

        <div>
          <p className="font-bold text-foreground">
            Rede:
          </p>

          <p className="capitalize">
            {nft.network}
          </p>
        </div>

        <div>
          <p className="font-bold text-foreground">
            Contrato:
          </p>

          <p>
            Contrato verificado. As vendas secundárias podem acontecer
            por mercados compatíveis.
          </p>
        </div>

        <div>
          <p className="font-bold text-foreground">
            Direitos autorais:
          </p>

          <p>
            Contrato inteligente verificado e propriedade digital
            registrada.
          </p>
        </div>
      </div>
    </section>
  )
}