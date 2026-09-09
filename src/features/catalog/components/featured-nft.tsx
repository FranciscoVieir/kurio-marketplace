export function FeaturedNft() {
  return (
    <section
      className="
        mt-4 flex h-[470px] w-[310px]
        flex-col gap-[10px]
        overflow-hidden
        pb-1 pt-6
      "
      style={{
        background:
          'linear-gradient(180deg, rgba(210, 138, 76, 0.1) 0%, rgba(210, 138, 76, 0.03) 100%)',
      }}
    >
      <div className="flex h-16 flex-col gap-4">
        <h2
          className="
            px-5 text-[24px] font-bold
            leading-[32px]
            text-[var(--color-text-accent)]
          "
        >
          NFT EM DESTAQUE
        </h2>

        <p
          className="
            text-center text-[22px]
            font-bold leading-[16px]
            text-foreground
          "
        >
          OFERTA LIMITADA
        </p>
      </div>

      <div
        className="
          h-[368px] w-[310px]
          overflow-hidden
          rounded-[22px]
          bg-card
        "
      >
        <div
          className="
            flex h-full items-center justify-center
            text-muted-foreground
          "
        >
          Featured NFT
        </div>
      </div>
    </section>
  )
}