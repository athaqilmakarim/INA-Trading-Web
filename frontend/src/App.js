import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import AddPlace from './pages/AddPlace';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { UserType } from './types/UserType';
import PlaceDetails from './pages/PlaceDetails';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/place/:id" element={<PlaceDetails />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
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
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center text-secondary-500">
                © 2024 INA Trading. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
