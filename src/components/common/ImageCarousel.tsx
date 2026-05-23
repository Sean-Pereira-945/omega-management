import { useMemo, useState } from 'react'

type ImageCarouselProps = {
  images: string[]
  title: string
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images])
  const [activeIndex, setActiveIndex] = useState(0)

  // Clamp the stored index so it is always valid when the image list shrinks
  const clampedIndex =
    safeImages.length > 0 ? Math.min(activeIndex, safeImages.length - 1) : 0

  const displayImage = safeImages[clampedIndex]

  const goPrev = () => {
    setActiveIndex(
      clampedIndex === 0 ? safeImages.length - 1 : clampedIndex - 1,
    )
  }

  const goNext = () => {
    setActiveIndex(
      clampedIndex === safeImages.length - 1 ? 0 : clampedIndex + 1,
    )
  }

  if (!safeImages.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] text-sm text-[var(--text-muted)]">
        No images available.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)]">
        <img
          src={displayImage}
          alt={title}
          className="h-72 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-2xl border ${
              index === clampedIndex
                ? 'border-ink-900'
                : 'border-[var(--border)]'
            }`}
          >
            <img
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
