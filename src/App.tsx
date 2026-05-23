import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import AnalyticsPage from './pages/AnalyticsPage'
import InventoryPage from './pages/InventoryPage'
import NotFoundPage from './pages/NotFoundPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import StockOrdersPage from './pages/StockOrdersPage'
import WarehousePage from './pages/WarehousePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/stock-orders" element={<StockOrdersPage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
