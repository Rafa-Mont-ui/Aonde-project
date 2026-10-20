import type { HTMLAttributes, ReactNode } from "react"

type TextProps = {
  children: ReactNode
  className?: string
} & Pick<HTMLAttributes<HTMLElement>, "id" | "aria-live">

export function Eyebrow({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <p
      {...props}
      className={`text-[.62em] font-bold uppercase leading-tight tracking-[.14em] [:where(&)]:text-accent ${className}`}
    >
      {children}
    </p>
  )
}

export function DisplayTitle({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <p
      role="heading"
      aria-level={1}
      {...props}
      className={`font-serif text-[1.8em] font-bold leading-[1.05] tracking-[-.02em] ${className}`}
    >
      {children}
    </p>
  )
}

export function PageTitle({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <p
      role="heading"
      aria-level={1}
      {...props}
      className={`font-serif text-[1.45em] font-bold leading-[1.15] tracking-[-.015em] ${className}`}
    >
      {children}
    </p>
  )
}

export function SectionTitle({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <p
      role="heading"
      aria-level={2}
      {...props}
      className={`font-serif text-[1.15em] font-bold leading-[1.2] ${className}`}
    >
      {children}
    </p>
  )
}

export function CardTitle({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <p
      role="heading"
      aria-level={3}
      {...props}
      className={`text-[.9em] font-semibold leading-[1.25] ${className}`}
    >
      {children}
    </p>
  )
}

export function BodyText({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <p
      {...props}
      className={`text-[.8em] leading-[1.6] [:where(&)]:text-foreground/75 ${className}`}
    >
      {children}
    </p>
  )
}

export function Caption({
  children,
  className = "",
  ...props
}: TextProps) {
  return (
    <span
      {...props}
      className={`text-[.62em] font-medium leading-[1.35] [:where(&)]:text-foreground/60 ${className}`}
    >
      {children}
    </span>
  )
}
