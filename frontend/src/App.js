import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/PageTransition/PageTransition';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import AddPlace from './pages/AddPlace';
import EditPlace from './pages/EditPlace';
import PlaceDetails from './pages/PlaceDetails';
import ExportProducts from './pages/ExportProducts';
import AddExportProduct from './pages/AddExportProduct';
import EditExportProduct from './pages/EditExportProduct';
import ExportProductDetail from './pages/ExportProductDetail';
import Admin from './pages/Admin';
import AdminSetup from './pages/AdminSetup';
import Login from './pages/Login';
import Register from './pages/Register';
import Auth from './pages/Auth';
import VerifyEmailRequired from './pages/VerifyEmailRequired';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import EditNews from './pages/EditNews';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserType } from './services/UserService';
import ForgotPassword from './pages/ForgotPassword';
import INAPASCallback from './pages/INAPASCallback';

// Wrapper component to handle navbar visibility
function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/auth/verify-email', '/verify-email-required', '/inapas/callback'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {showNavbar && <Navbar />}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
            <Route path="/export-products" element={<PageTransition><ExportProducts /></PageTransition>} />
            <Route path="/news" element={<PageTransition><NewsList /></PageTransition>} />
            <Route path="/news/:id" element={<PageTransition><NewsDetail /></PageTransition>} />
            <Route
              path="/admin/news/edit/:id"
              element={
                <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                  <PageTransition><EditNews /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/auth/verify-email" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/verify-email-required" element={<PageTransition><VerifyEmailRequired /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/inapas/callback" element={<PageTransition><INAPASCallback /></PageTransition>} />
            
            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageTransition><Profile /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-place"
              element={
                <ProtectedRoute>
                  <PageTransition><AddPlace /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-place/:id"
              element={
                <ProtectedRoute>
                  <PageTransition><EditPlace /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/place/:id"
              element={
                <ProtectedRoute>
                  <PageTransition><PlaceDetails /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-export-product"
              element={
                <ProtectedRoute>
                  <PageTransition><AddExportProduct /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-export-product/:id"
              element={
                <ProtectedRoute>
                  <PageTransition><EditExportProduct /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/export-product/:id"
              element={
                <ProtectedRoute>
                  <PageTransition><ExportProductDetail /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                  <PageTransition><Admin /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-setup"
              element={
                <ProtectedRoute>
                  <PageTransition><AdminSetup /></PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
      {showNavbar && <Footer />}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#22c55e',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
