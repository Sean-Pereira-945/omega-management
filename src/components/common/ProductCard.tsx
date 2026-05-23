import { memo } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import type { Product } from '../../hooks/useProductFetch'

type ProductCardProps = {
  product: Product
  isHighlighted?: boolean
}

const getStockBadge = (stock: number) => {
  if (stock <= 0) {
    return { label: 'Out of stock', className: 'bg-sun-600 text-white' }
  }
  if (stock < 10) {
    return { label: 'Low stock', className: 'bg-sun-500 text-white' }
  }
  return { label: 'In stock', className: 'bg-mint-500 text-ink-900' }
}

function ProductCard({ product, isHighlighted }: ProductCardProps) {
  const badge = getStockBadge(product.stock)

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition hover:-translate-y-1 ${
        isHighlighted
          ? 'ring-2 ring-mint-500/60 shadow-[0_0_0_1px_rgba(63,202,164,0.4)]'
          : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span
          className={`absolute left-4 top-4 inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {product.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[var(--text-primary)]">
            {product.title}
          </h3>
        </div>
        <p className="line-clamp-2 text-sm text-[var(--text-muted)]">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm font-semibold text-[var(--text-muted)]">
            {product.rating.toFixed(1)} rating
          </span>
        </div>
      </div>
    </Link>
  )
}

export default memo(ProductCard)
