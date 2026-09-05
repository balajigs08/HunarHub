import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useAuthStore } from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { EntrepreneursPage } from './pages/EntrepreneursPage';
import { EntrepreneurProfilePage } from './pages/EntrepreneurProfilePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { EntrepreneurDashboard } from './pages/EntrepreneurDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { ServiceRequestDetailsPage } from './pages/ServiceRequestDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Pages & Aliases */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/artisan" element={<RegisterPage />} />
            <Route path="/register/entrepreneur" element={<RegisterPage />} />

            {/* Marketplace & Products */}
            <Route path="/marketplace" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/marketplace/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* Services */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />

            {/* Artisans & Micro-Entrepreneurs */}
            <Route path="/artisans" element={<EntrepreneursPage />} />
            <Route path="/entrepreneurs" element={<EntrepreneursPage />} />
            <Route path="/artisans/:id" element={<EntrepreneurProfilePage />} />
            <Route path="/entrepreneurs/:id" element={<EntrepreneurProfilePage />} />

            {/* Categories */}
            <Route path="/categories" element={<CategoriesPage />} />

            {/* Static Content */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/customer/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Customer Dashboard & Sub-routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/service-requests"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/service-requests/:id"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ServiceRequestDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/complaints"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/complaints/new"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />

            {/* Entrepreneur Dashboard & Sub-routes */}
            <Route
              path="/entrepreneur/dashboard"
              element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entrepreneur/services"
              element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entrepreneur/products"
              element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entrepreneur/orders"
              element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entrepreneur/service-requests"
              element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entrepreneur/earnings"
              element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard & Sub-routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/entrepreneurs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Account Profile & Utilities */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
