import { Link, useParams } from 'react-router-dom'
import ImageCarousel from '../components/common/ImageCarousel'
import useProductDetail from '../hooks/useProductDetail'
import { formatCurrency } from '../utils/formatters'

const getStockMeta = (stock: number) => {
  if (stock <= 0) {
    return { label: 'Out of Stock', className: 'bg-sun-600 text-white' }
  }
  if (stock < 10) {
    return { label: 'Low Stock', className: 'bg-sun-500 text-white' }
  }
  return { label: 'In Stock', className: 'bg-mint-500 text-ink-900' }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { product, isLoading, error } = useProductDetail(id)

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-[var(--text-muted)]">Loading product...</p>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
          Product unavailable
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {error ?? 'We could not load this product.'}
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
        >
          Back to products
        </Link>
      </section>
    )
  }

  const stockMeta = getStockMeta(product.stock)

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <ImageCarousel images={product.images} title={product.title} />
      <div className="flex flex-col gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {product.category}
          </p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${stockMeta.className}`}
          >
            {stockMeta.label}
          </span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            {product.title}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)]">{product.description}</p>
        </div>
        <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Price</span>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              {formatCurrency(product.price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Rating</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {product.rating.toFixed(1)} / 5
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Available stock</span>
            <span className="font-semibold text-[var(--text-primary)]">{product.stock}</span>
          </div>
        </div>
        <Link
          to="/products"
          className="inline-flex w-fit rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]"
        >
          Back to products
        </Link>
      </div>
    </section>
  )
}
