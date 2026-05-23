import { Suspense, lazy, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Panel from '../components/common/Panel'
import ScrollReveal from '../components/common/ScrollReveal'
import useProductFetch from '../hooks/useProductFetch'
import { formatCurrency } from '../utils/formatters'

const CategoryChart = lazy(() => import('../components/dashboard/CategoryChart'))

const formatCompactCurrency = (value: number) => {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)
    return `$${formatted}k`
  }
  return `$${value}`
}

export default function AnalyticsPage() {
  const { products, isLoading, error, refetch } = useProductFetch()

  const totalProducts = products.length

  const averageRating = useMemo(() => {
    if (!products.length) {
      return 0
    }
    const sum = products.reduce((acc, product) => acc + product.rating, 0)
    return sum / products.length
  }, [products])

  const inventoryValue = useMemo(() => {
    return products.reduce(
      (acc, product) => acc + product.price * product.stock,
      0,
    )
  }, [products])

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((product) => {
      map.set(product.category, (map.get(product.category) ?? 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [products])

  const categorySales = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((product) => {
      const value = product.price * product.stock
      map.set(product.category, (map.get(product.category) ?? 0) + value)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [products])

  const topSoldProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 6)
      .map((product) => ({
        name: product.title,
        value: product.stock,
      }))
  }, [products])

  const inDemandProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const aScore = (10 - Math.min(a.stock, 10)) * 2 + a.rating
        const bScore = (10 - Math.min(b.stock, 10)) * 2 + b.rating
        return bScore - aScore
      })
      .slice(0, 6)
      .map((product) => ({
        name: product.title,
        value: Math.max(1, 10 - Math.min(product.stock, 10)) + product.rating,
      }))
  }, [products])

  const stockMovement = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const base = products.reduce((acc, product) => acc + product.stock, 0)
    return months.map((label, index) => {
      const delta = Math.sin(index + 1) * 12 + index * 2
      return { label, value: Math.max(0, Math.round(base / 6 + delta)) }
    })
  }, [products])

  const revenueGrowth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const base = products.reduce(
      (acc, product) => acc + product.price * Math.max(product.stock, 1),
      0,
    )
    return months.map((label, index) => {
      const factor = 0.85 + index * 0.04
      return { label, value: Math.round(base * factor) }
    })
  }, [products])

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ScrollReveal delay={0}>
          <Panel
            title="Total products"
            subtitle="Live inventory count"
          >
            <p className="text-3xl font-semibold text-[var(--text-primary)]">{totalProducts}</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Panel title="Average rating" subtitle="Across all listings">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">
              {averageRating.toFixed(2)}
            </p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Panel title="Inventory value" subtitle="Price x stock">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">
              {formatCurrency(inventoryValue)}
            </p>
          </Panel>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={100}>
        <Panel
          title="Category distribution"
          subtitle="Top categories by product count"
          action={
            error ? (
              <span className="rounded-full bg-sun-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {error}
              </span>
            ) : null
          }
        >
          {isLoading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading analytics...</p>
          ) : error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-[var(--text-muted)]">Unable to load analytics.</p>
              <button
                type="button"
                onClick={refetch}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
              >
                Retry
              </button>
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No data to display yet.</p>
          ) : (
            <Suspense
              fallback={<p className="text-sm text-[var(--text-muted)]">Loading chart...</p>}
            >
              <CategoryChart data={categoryBreakdown} />
            </Suspense>
          )}
        </Panel>
      </ScrollReveal>

      <div className="grid gap-6 xl:grid-cols-2">
        <ScrollReveal delay={50}>
          <Panel title="Sales vs categories" subtitle="Inventory value by category">
            {categorySales.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No data to display yet.</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={categorySales} margin={{ left: 8, right: 8, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tickFormatter={formatCompactCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#3fcaa4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <Panel title="Revenue growth" subtitle="Projected over 6 months">
            {revenueGrowth.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No data to display yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={revenueGrowth} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={formatCompactCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ff7a45"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </ScrollReveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ScrollReveal delay={50}>
          <Panel title="Most sold products" subtitle="Top by stock volume">
            {topSoldProducts.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No data to display yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={topSoldProducts} layout="vertical" margin={{ left: 16, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={140} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0d0f1a" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <Panel title="Most in-demand products" subtitle="High demand signals">
            {inDemandProducts.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No data to display yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={inDemandProducts} layout="vertical" margin={{ left: 16, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={140} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6b6f84" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={50}>
        <Panel title="Stock movement" subtitle="Inventory flow tracking">
          {stockMovement.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No data to display yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={stockMovement} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3fcaa4"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </ScrollReveal>
    </section>
  )
}
