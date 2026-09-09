import type { PropsWithChildren } from 'react'

type PageContainerProps = PropsWithChildren<{
  className?: string
}>

export function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1200px] ${className}`}
    >
      {children}
    </div>
  )
}