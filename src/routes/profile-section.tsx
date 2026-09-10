type ProfileSectionPageProps = {
  title: string
  description: string
}

export function ProfileSectionPage({
  title,
  description,
}: ProfileSectionPageProps) {
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-sm font-semibold text-[var(--color-foreground-kurio)]">
          {title}
        </h1>

        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
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
        "
      >
        <p className="text-xs text-[var(--color-text-secondary)]">
          Esta área será implementada no próximo bloco funcional.
        </p>
      </div>
    </section>
  )
}