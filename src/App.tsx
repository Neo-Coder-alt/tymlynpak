import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/store/auth';
import { ToastProvider } from '@/store/toast';
import { SettingsProvider } from '@/store/settings';
import { StorefrontLayout } from '@/layouts/StorefrontLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/admin/ProtectedRoute';

// Storefront pages
import { HomePage } from '@/pages/storefront/HomePage';
import { CollectionPage } from '@/pages/storefront/CollectionPage';
import { ProductPage } from '@/pages/storefront/ProductPage';
import { CheckoutPage } from '@/pages/storefront/CheckoutPage';
import { AboutPage } from '@/pages/storefront/AboutPage';
import { ContactPage } from '@/pages/storefront/ContactPage';

// Admin pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminMediaPage } from '@/pages/admin/AdminMediaPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminAccountPage } from '@/pages/admin/AdminAccountPage';

function NotFoundPage() {
  return (
    <div className="pt-32 pb-20 text-center">
      <h1 className="text-6xl font-serif text-white">404</h1>
      <p className="text-zinc-400 mt-4">Page not found</p>
      <a href="/" className="inline-block mt-6 text-amber-400 hover:underline">Return home</a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Storefront */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin auth */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin (protected) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="account" element={<AdminAccountPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
