type ProfileSectionPageProps = {
  title: string
  description: string
}

export function ProfileSectionPage({
  title,
  description,
}: ProfileSectionPageProps) {
  return (
    <section
      className="
        max-md:mx-auto
        max-md:w-full
        max-md:max-w-[366px]
      "
    >
      <div
        className="
          mb-6

          max-md:mb-[24px]
        "
      >
        <h1
          className="
            text-sm
            font-semibold
            text-[var(--color-foreground-kurio)]

            max-md:text-[20px]
            max-md:font-bold
            max-md:leading-[24px]
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-2
            text-xs
            text-[var(--color-text-secondary)]

            max-md:mt-[6px]
            max-md:text-[13px]
            max-md:leading-[20px]
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          min-h-48
          border
          border-[var(--color-border-kurio)]
          bg-[var(--color-surface-card)]
          p-6

          max-md:min-h-[180px]
          max-md:rounded-[14px]
          max-md:px-[16px]
          max-md:py-[18px]
        "
      >
        <p
          className="
            text-xs
            text-[var(--color-text-secondary)]

            max-md:text-[13px]
            max-md:leading-[20px]
          "
        >
          Esta área será implementada no próximo bloco funcional.
        </p>
      </div>
    </section>
  )
}