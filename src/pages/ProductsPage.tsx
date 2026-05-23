import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/common/ProductCard'
import ScrollReveal from '../components/common/ScrollReveal'
import useDebounce from '../hooks/useDebounce'
import useProductFetch, { type Product } from '../hooks/useProductFetch'
import { formatCurrency } from '../utils/formatters'
import { apiFetch } from '../utils/api'

type ColumnKey = 'name' | 'category' | 'price' | 'rating' | 'stock' | 'status'

type NewProductInput = {
  title: string
  category: string
  price: string
  rating: string
  stock: string
  description: string
  thumbnail: string
}

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' },
]

const getStockMeta = (stock: number) => {
  if (stock <= 0) {
    return { label: 'Out of stock', className: 'bg-sun-600 text-white' }
  }
  if (stock < 10) {
    return { label: 'Low stock', className: 'bg-sun-500 text-white' }
  }
  return { label: 'In stock', className: 'bg-mint-500 text-ink-900' }
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // inputValue drives the text field; debouncedSearch pushes it to the URL
  const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(inputValue, 300)
  const { products, categories, isLoading, error, refetch } = useProductFetch()
  const [liveProducts, setLiveProducts] = useState<Product[]>([])
  // Track the canonical products list so the interval can reset liveProducts on change
  const productsRef = useRef(products)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showColumns, setShowColumns] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    'name',
    'category',
    'price',
    'rating',
    'stock',
    'status',
  ])
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'table'
    }
    return 'table'
  })
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true)
  const currentPage = useMemo(() => {
    const raw = searchParams.get('page')
    if (!raw) return 1
    const parsed = Number(raw)
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
  }, [searchParams])
  const itemsPerPage = 9

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setSearchParams(next)
  }
  const columnButtonRef = useRef<HTMLButtonElement | null>(null)
  const columnPanelRef = useRef<HTMLDivElement | null>(null)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement | null>(null)

  const sortOptions = useMemo(() => [
    { value: 'price-asc', label: 'Price (Low)' },
    { value: 'price-desc', label: 'Price (High)' },
    { value: 'rating-desc', label: 'Rating' },
    { value: 'name-asc', label: 'Name' },
  ], [])

  useEffect(() => {
    if (!isSortOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSortOpen])

  const [newProduct, setNewProduct] = useState<NewProductInput>({
    title: '',
    category: '',
    price: '',
    rating: '4.2',
    stock: '',
    description: '',
    thumbnail: '',
  })

  const selectedCategories = useMemo(() => {
    const raw = searchParams.get('category')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])

  const sort = searchParams.get('sort') ?? 'price-asc'
  const isAddFormOpen = searchParams.get('add') === '1'

  useEffect(() => {
    // Always seed liveProducts when the canonical list changes,
    // regardless of whether live updates are enabled
    if (productsRef.current !== products) {
      productsRef.current = products
      setLiveProducts(products)
    }
  }, [products])

  useEffect(() => {
    if (!products.length || !liveUpdatesEnabled) {
      return
    }

    const interval = window.setInterval(() => {
      setLiveProducts((prev) => {
        if (!prev.length || document.hidden) {
          return prev
        }
        const index = Math.floor(Math.random() * prev.length)
        const target = prev[index]
        const updateStock = Math.random() < 0.6
        const stockDelta = updateStock
          ? (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3))
          : 0
        const priceDelta = updateStock
          ? 0
          : (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 5))
        const nextStock = Math.max(0, target.stock + stockDelta)
        const nextPrice = Math.max(1, target.price + priceDelta)
        const updated = {
          ...target,
          stock: nextStock,
          price: nextPrice,
        }
        const next = [...prev]
        next[index] = updated

        const changeLabel = updateStock
          ? `stock to ${nextStock}`
          : `price to ${formatCurrency(nextPrice)}`
        setHighlightedId(updated.id)
        setToast(`Live update: ${updated.title} ${changeLabel}.`)

        return next
      })
    }, 8000)

    return () => window.clearInterval(interval)
  }, [products, liveUpdatesEnabled])


  useEffect(() => {
    if (!highlightedId) {
      return
    }
    const timer = window.setTimeout(() => setHighlightedId(null), 2000)
    return () => window.clearTimeout(timer)
  }, [highlightedId])

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (debouncedSearch === (searchParams.get('search') ?? '')) {
      return
    }
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch.trim()) {
      next.set('search', debouncedSearch.trim())
    } else {
      next.delete('search')
    }
    next.delete('page')
    setSearchParams(next)
  }, [debouncedSearch, searchParams, setSearchParams])

  const updateCategories = (category: string) => {
    const next = new URLSearchParams(searchParams)
    const list = new Set(selectedCategories)
    if (list.has(category)) {
      list.delete(category)
    } else {
      list.add(category)
    }
    const nextValue = Array.from(list)
    if (nextValue.length) {
      next.set('category', nextValue.join(','))
    } else {
      next.delete('category')
    }
    next.delete('page')
    setSearchParams(next)
  }

  const updateSort = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('sort', value)
    next.delete('page')
    setSearchParams(next)
  }

  const openAddProduct = () => {
    const next = new URLSearchParams(searchParams)
    next.set('add', '1')
    setSearchParams(next)
  }

  const closeAddProduct = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    next.delete('add')
    setSearchParams(next)
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!isAddFormOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAddProduct()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAddFormOpen, closeAddProduct])

  const resetFilters = () => {
    const next = new URLSearchParams()
    next.set('sort', 'price-asc')
    setSearchParams(next)
    setInputValue('')
    setShowAllCategories(false)
  }

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== key)
      }
      return [...prev, key]
    })
  }

  const normalizedSearch = (searchParams.get('search') ?? '')
    .toLowerCase()
    .trim()

  const handleAddInput = (key: keyof NewProductInput, value: string) => {
    setNewProduct((current) => ({ ...current, [key]: value }))
  }

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = newProduct.title.trim()
    const category = newProduct.category.trim()
    const price = Number(newProduct.price)
    const rating = Number(newProduct.rating)
    const stock = Number(newProduct.stock)
    if (!title || !category || Number.isNaN(price) || Number.isNaN(stock)) {
      setToast('Please complete name, category, price, and stock.')
      return
    }

    const payload = {
      title,
      category,
      price: Math.max(1, price),
      rating: Number.isNaN(rating) ? 4 : Math.min(Math.max(rating, 0), 5),
      stock: Math.max(0, stock),
      description: newProduct.description.trim() || 'New product entry.',
      thumbnail:
        newProduct.thumbnail.trim() || 'https://placehold.co/600x400?text=New',
      images: [],
    }

    try {
      const created = await apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setToast(`Added ${created.title}.`)
      refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add product.'
      setToast(message)
      return
    }

    setNewProduct({
      title: '',
      category: '',
      price: '',
      rating: '4.2',
      stock: '',
      description: '',
      thumbnail: '',
    })
    closeAddProduct()
  }

  useEffect(() => {
    if (!showColumns) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (columnPanelRef.current?.contains(target)) {
        return
      }
      if (columnButtonRef.current?.contains(target)) {
        return
      }
      setShowColumns(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowColumns(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showColumns])

  const filteredProducts = useMemo(() => {
    return liveProducts.filter((product) => {
      const matchesSearch = normalizedSearch
        ? product.title.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch)
        : true
      const matchesCategory = selectedCategories.length
        ? selectedCategories.includes(product.category)
        : true
      return matchesSearch && matchesCategory
    })
  }, [liveProducts, normalizedSearch, selectedCategories])

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    switch (sort) {
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      case 'rating-desc':
        return list.sort((a, b) => b.rating - a.rating)
      case 'name-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return list.sort((a, b) => a.price - b.price)
    }
  }, [filteredProducts, sort])

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(sortedProducts.length / itemsPerPage), 1)
  }, [sortedProducts])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedProducts.slice(start, start + itemsPerPage)
  }, [sortedProducts, currentPage])

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 10)
  const hiddenCount = Math.max(categories.length - visibleCategories.length, 0)

  const totalProducts = liveProducts.length

  const averageRating = useMemo(() => {
    if (!liveProducts.length) {
      return 0
    }
    const sum = liveProducts.reduce((acc, product) => acc + product.rating, 0)
    return sum / liveProducts.length
  }, [liveProducts])

  const inventoryValue = useMemo(() => {
    return liveProducts.reduce(
      (acc, product) => acc + product.price * product.stock,
      0,
    )
  }, [liveProducts])

  const lowStockCount = useMemo(() => {
    return liveProducts.filter((product) => product.stock > 0 && product.stock < 10)
      .length
  }, [liveProducts])

  const categoryValueBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    liveProducts.forEach((product) => {
      const value = product.price * product.stock
      map.set(product.category, (map.get(product.category) ?? 0) + value)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [liveProducts])

  return (
    <section className="space-y-6">
      {isAddFormOpen ? (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={closeAddProduct}
        >
          <div 
            className="relative w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  Add New Product
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Create a local entry for your dashboard session.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddProduct}
                className="flex items-center justify-center h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddProduct}>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Name
                <input
                  value={newProduct.title}
                  onChange={(event) => handleAddInput('title', event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="Product name"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Category
                <input
                  value={newProduct.category}
                  onChange={(event) => handleAddInput('category', event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="Category"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(event) => handleAddInput('price', event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="0.00"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Stock
                <input
                  type="number"
                  min="0"
                  value={newProduct.stock}
                  onChange={(event) => handleAddInput('stock', event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="0"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Rating
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newProduct.rating}
                  onChange={(event) => handleAddInput('rating', event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="4.2"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Thumbnail URL
                <input
                  value={newProduct.thumbnail}
                  onChange={(event) => handleAddInput('thumbnail', event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="https://"
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Description
                <textarea
                  value={newProduct.description}
                  onChange={(event) => handleAddInput('description', event.target.value)}
                  className="min-h-[96px] rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 text-[var(--text-primary)]"
                  placeholder="Short product summary"
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 mt-4 border-t border-[var(--border)] pt-4">
                <button
                  type="button"
                  onClick={closeAddProduct}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ink-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all hover:scale-105 active:scale-95 shadow-soft"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
            Search
            <input
              type="search"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)]"
              placeholder="Search inventory"
              aria-label="Search inventory"
            />
          </label>
          <div className="flex min-w-[200px] flex-col gap-2 text-sm font-semibold text-[var(--text-primary)] relative" ref={sortRef}>
            <span>Sort</span>
            <button
              type="button"
              onClick={() => setIsSortOpen(prev => !prev)}
              className="flex items-center justify-between w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)] font-normal text-left focus:outline-none transition hover:bg-[var(--surface-muted)]"
              aria-haspopup="true"
              aria-expanded={isSortOpen}
            >
              <span>Sort by: {sortOptions.find(o => o.value === sort)?.label ?? 'Price (Low)'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isSortOpen ? (
              <div className="absolute top-full left-0 z-40 mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-1.5 shadow-2xl animate-fade-in animate-scale-in flex flex-col gap-0.5">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateSort(option.value)
                      setIsSortOpen(false)
                    }}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm text-left transition duration-150 ${
                      sort === option.value
                        ? 'bg-ink-900 text-white font-semibold shadow-soft'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                    }`}
                  >
                    Sort by: {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openAddProduct}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
            >
              Add product
            </button>
            <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] p-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-pressed={viewMode === 'table'}
                className={`rounded-full px-3 py-1 ${
                  viewMode === 'table'
                    ? 'bg-ink-900 text-white'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`rounded-full px-3 py-1 ${
                  viewMode === 'grid'
                    ? 'bg-ink-900 text-white'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Grid
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumns((prev) => !prev)}
                ref={columnButtonRef}
                aria-expanded={showColumns}
                aria-controls="column-tune-panel"
                className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
              >
                Tune
              </button>
              {showColumns ? (
                <div
                  id="column-tune-panel"
                  ref={columnPanelRef}
                  role="dialog"
                  aria-label="Visible columns"
                  className="absolute right-0 top-full z-10 mt-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-3 shadow-[var(--shadow)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Visible
                  </p>
                  <div className="mt-3 space-y-2">
                    {columnOptions.map((option) => (
                      <label
                        key={option.key}
                        className="flex items-center justify-between text-sm text-[var(--text-primary)]"
                      >
                        <span>{option.label}</span>
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(option.key)}
                          onChange={() => toggleColumn(option.key)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {visibleCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => updateCategories(category)}
              aria-pressed={selectedCategories.includes(category)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                selectedCategories.includes(category)
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)]'
              }`}
            >
              {category}
            </button>
          ))}
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAllCategories((prev) => !prev)}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]"
            >
              {showAllCategories ? 'Show less' : `+${hiddenCount} more`}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Category Value
            </h3>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Total
            </p>
          </div>
          <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {formatCurrency(inventoryValue)}
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {categoryValueBreakdown.slice(0, 3).map((category) => {
              const percent = inventoryValue
                ? Math.round((category.value / inventoryValue) * 100)
                : 0
              return (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">{category.name}</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {percent}% - {formatCurrency(category.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                System Health
              </p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">
                Last synced: Just now
              </p>
            </div>
            <span className="rounded-full bg-mint-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]">
              Healthy
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Total Products</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
            {totalProducts}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Live inventory count</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Avg Rating</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
            {averageRating.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Across all listings</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Inventory Value</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
            {formatCurrency(inventoryValue)}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Price x stock</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Low Stock</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
            {lowStockCount}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Needs attention</p>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Inventory Watchlist
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Showing {sortedProducts.length} of {totalProducts} products
            </p>
            {normalizedSearch ? (
              <p className="text-xs text-[var(--text-muted)]">Search term: "{normalizedSearch}"</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-mint-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]">
              Live updates
            </span>
            <button
              type="button"
              onClick={() => setLiveUpdatesEnabled((prev) => !prev)}
              aria-pressed={liveUpdatesEnabled}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
            >
              {liveUpdatesEnabled ? 'On' : 'Off'}
            </button>
            {error ? (
              <span className="rounded-full bg-sun-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {error}
              </span>
            ) : null}
          </div>
        </div>

        {toast ? (
          <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-mint-500/40 bg-[var(--surface-strong)] p-4 shadow-2xl animate-fade-in animate-slide-up">
            <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-mint-500 animate-pulse" />
            <p className="text-sm font-semibold text-[var(--text-primary)] pr-2 leading-snug">
              {toast}
            </p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold shrink-0 transition-colors"
              aria-label="Close alert"
            >
              ✕
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Loading products...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-[var(--text-muted)]">Unable to load products.</p>
              <button
                type="button"
                onClick={refetch}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
              >
                Retry
              </button>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-[var(--text-muted)]">No products match your filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product, index) => (
              <ScrollReveal
                key={product.id}
                delay={(index % 3) * 60}
              >
                <ProductCard
                  product={product}
                  isHighlighted={highlightedId === product.id}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Inventory watchlist</caption>
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  {visibleColumns.includes('name') ? (
                    <th scope="col" className="px-6 py-4">Product</th>
                  ) : null}
                  {visibleColumns.includes('category') ? (
                    <th scope="col" className="px-6 py-4">Category</th>
                  ) : null}
                  {visibleColumns.includes('price') ? (
                    <th scope="col" className="px-6 py-4">Price</th>
                  ) : null}
                  {visibleColumns.includes('rating') ? (
                    <th scope="col" className="px-6 py-4">Rating</th>
                  ) : null}
                  {visibleColumns.includes('stock') ? (
                    <th scope="col" className="px-6 py-4">Stock</th>
                  ) : null}
                  {visibleColumns.includes('status') ? (
                    <th scope="col" className="px-6 py-4">Status</th>
                  ) : null}
                  <th scope="col" className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const stockMeta = getStockMeta(product.stock)
                  return (
                    <tr
                      key={product.id}
                      className={`border-t border-[var(--border)] transition-colors duration-300 hover:bg-[var(--surface-muted)] ${
                        highlightedId === product.id
                          ? 'bg-mint-500/10 dark:bg-mint-500/20'
                          : ''
                      }`}
                    >
                      {visibleColumns.includes('name') ? (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-10 w-10 rounded-xl object-cover"
                              loading="lazy"
                            />
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">
                                {product.title}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {product.description.slice(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.includes('category') ? (
                        <td className="px-6 py-4 text-[var(--text-muted)]">
                          {product.category}
                        </td>
                      ) : null}
                      {visibleColumns.includes('price') ? (
                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                          {formatCurrency(product.price)}
                        </td>
                      ) : null}
                      {visibleColumns.includes('rating') ? (
                        <td className="px-6 py-4 text-[var(--text-muted)]">
                          {product.rating.toFixed(1)}
                        </td>
                      ) : null}
                      {visibleColumns.includes('stock') ? (
                        <td className="px-6 py-4 text-[var(--text-muted)]">
                          {product.stock}
                        </td>
                      ) : null}
                      {visibleColumns.includes('status') ? (
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${stockMeta.className}`}
                          >
                            {stockMeta.label}
                          </span>
                        </td>
                      ) : null}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between border-t border-[var(--border)] px-6 py-4 gap-4 bg-[var(--surface-muted)]/30 rounded-b-3xl">
            <p className="text-xs text-[var(--text-muted)]">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} entries
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => updatePage(currentPage - 1)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] disabled:opacity-40 transition hover:bg-[var(--surface-muted)] active:scale-95"
              >
                Previous
              </button>
              <span className="flex items-center px-2 text-xs font-semibold text-[var(--text-primary)]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => updatePage(currentPage + 1)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] disabled:opacity-40 transition hover:bg-[var(--surface-muted)] active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
