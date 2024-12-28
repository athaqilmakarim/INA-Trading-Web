import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import AddPlace from './pages/AddPlace';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { UserType } from './types/UserType';
import PlaceDetails from './pages/PlaceDetails';
import Admin from './pages/Admin';
import ExportProducts from './pages/ExportProducts';
import ExportProductDetail from './pages/ExportProductDetail';
import AddExportProduct from './pages/AddExportProduct';
import SupplierProfile from './pages/SupplierProfile';
import About from './pages/About';
import NewsDetail from './pages/NewsDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/place/:id" element={<PlaceDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route 
                path="/add-place" 
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.B2C_BUSINESS_OWNER]}>
                    <AddPlace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
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
                path="/add-export-product" 
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.B2B_SUPPLIER]}>
                    <AddExportProduct />
                  </ProtectedRoute>
                } 
              />
              <Route path="/export-products" element={<ExportProducts />} />
              <Route path="/export-product/:id" element={<ExportProductDetail />} />
              <Route 
                path="/supplier-profile" 
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.B2B_SUPPLIER]}>
                    <SupplierProfile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
