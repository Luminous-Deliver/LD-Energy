import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  href?: string | null
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const displayHeights: Record<string, string> = {
  sm: 'h-10',
  md: 'h-12 md:h-14',
  lg: 'h-14 md:h-16',
}

export function Logo({ className, href = '/', variant = 'dark', size = 'md' }: LogoProps) {
  const img = (
    <Image
      src="/logo.webp"
      alt="L&D Energy"
      width={552}
      height={240}
      priority
      className={cn(
        'block max-w-full object-contain w-auto',
        displayHeights[size],
        // Logo has a transparent bg — render as a solid white silhouette
        // on dark backgrounds so it reads clearly against the dark footer
        variant === 'light' && 'brightness-0 invert',
      )}
    />
  )

  const content = <span className={cn('inline-flex min-w-0 items-center', className)}>{img}</span>

  if (!href) return content

  return (
    <Link href={href} aria-label="L&D Energy — home" className="inline-flex min-w-0">
      {content}
    </Link>
  )
}
