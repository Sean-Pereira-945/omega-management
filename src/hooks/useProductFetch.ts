import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

export type Product = {
  id: number
  title: string
  description: string
  price: number
  rating: number
  stock: number
  category: string
  thumbnail: string
  images: string[]
}

export type ProductResponse = {
  products: Product[]
  total: number
  skip: number
  limit: number
}

type ProductFetchState = {
  products: Product[]
  categories: string[]
  total: number
  isLoading: boolean
  error: string | null
  notice: string | null
  refetch: () => void
}

const normalizeCategories = (data: unknown) => {
  if (!Array.isArray(data)) {
    return [] as string[]
  }

  return data
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }
      if (item && typeof item === 'object') {
        const candidate = item as { name?: string; slug?: string }
        return candidate.name ?? candidate.slug ?? ''
      }
      return ''
    })
    .filter(Boolean)
}

export default function useProductFetch(): ProductFetchState {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setNotice(null)

      try {
        try {
          const [productData, categoryData] = await Promise.all([
            apiFetch<ProductResponse>('/products?limit=100'),
            apiFetch<Array<{ id: number; name: string }>>('/categories'),
          ])

          if (!isActive) {
            return
          }

          setProducts(productData.products)
          setTotal(productData.total)
          setCategories(normalizeCategories(categoryData))
        } catch (apiError) {
          const [productResponse, categoryResponse] = await Promise.all([
            fetch('https://dummyjson.com/products?limit=100', {
              signal: controller.signal,
            }),
            fetch('https://dummyjson.com/products/categories', {
              signal: controller.signal,
            }),
          ])

          if (!productResponse.ok || !categoryResponse.ok) {
            throw apiError
          }

          const productData = (await productResponse.json()) as ProductResponse
          const categoryData = await categoryResponse.json()

          if (!isActive) {
            return
          }

          setProducts(productData.products)
          setTotal(productData.total)
          setCategories(normalizeCategories(categoryData))
          setNotice('Using demo data (backend offline).')
        }
      } catch (caught) {
        if (!isActive) {
          return
        }
        const message =
          caught instanceof Error ? caught.message : 'Unknown error'
        setError(message)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [reloadKey])

  const refetch = () => setReloadKey((current) => current + 1)

  return { products, categories, total, isLoading, error, notice, refetch }
}
