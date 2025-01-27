import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
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

// Wrapper component to handle navbar visibility
function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/auth/verify-email', '/verify-email-required'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/export-products" element={<ExportProducts />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route
            path="/admin/news/edit/:id"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                <EditNews />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/verify-email" element={<Auth />} />
          <Route path="/verify-email-required" element={<VerifyEmailRequired />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-place"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.B2C_BUSINESS_OWNER, UserType.ADMIN]}>
                <AddPlace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-place/:placeId"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.B2C_BUSINESS_OWNER, UserType.ADMIN]}>
                <EditPlace />
              </ProtectedRoute>
            }
          />
          <Route path="/place/:placeId" element={<PlaceDetails />} />
          <Route
            path="/add-export-product"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.B2B_SUPPLIER, UserType.ADMIN]}>
                <AddExportProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-export-product/:id"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.B2B_SUPPLIER, UserType.ADMIN]}>
                <EditExportProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/export-product/:id" element={<ExportProductDetail />} />
          <Route
            path="/news/edit/:id"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                <EditNews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-setup"
            element={
              <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                <AdminSetup />
              </ProtectedRoute>
            }
          />
        </Routes>
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
