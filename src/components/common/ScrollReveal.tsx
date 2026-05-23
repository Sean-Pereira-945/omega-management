import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  animationClass?: string
  threshold?: number
  delay?: number // in milliseconds
}

export default function ScrollReveal({
  children,
  className = '',
  animationClass = 'animate-slide-up',
  threshold = 0.05,
  delay = 0,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px', // trigger slightly before fully in viewport
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`${className} ${
        isVisible ? `${animationClass} opacity-100` : 'opacity-0'
      } will-change-[transform,opacity]`}
      style={{
        animationDelay: delay ? `${delay}ms` : undefined,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  )
}
