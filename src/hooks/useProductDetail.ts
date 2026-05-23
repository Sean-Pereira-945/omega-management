import { useEffect, useState } from 'react'
import type { Product } from './useProductFetch'
import { apiFetch } from '../utils/api'

export default function useProductDetail(id?: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip fetch entirely when id is not available — no state mutations here
    if (!id) {
      return
    }

    const controller = new AbortController()
    let isActive = true

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let data: Product
        try {
          data = await apiFetch<Product>(`/products/${id}`, {
            signal: controller.signal,
          })
        } catch (apiError) {
          const response = await fetch(`https://dummyjson.com/products/${id}`, {
            signal: controller.signal,
          })

          if (!response.ok) {
            throw apiError
          }

          data = (await response.json()) as Product
          setError(null)
        }
        if (!isActive) {
          return
        }

        setProduct(data)
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
  }, [id])

  // Derive the no-id error without touching React state inside an effect
  if (!id) {
    return { product: null, isLoading: false, error: 'Missing product id' }
  }

  return { product, isLoading, error }
}
