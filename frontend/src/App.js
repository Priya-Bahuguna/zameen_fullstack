import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import AIEstimator from './pages/AIEstimator';
import PriceHistory from './pages/PriceHistory';
import AreaRatings from './pages/AreaRatings';
import Investment from './pages/Investment';
import Compare from './pages/Compare';
import ListProperty from './pages/ListProperty';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#1a6b3a', secondary: '#fff' } },
          }}
        />
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/ai-estimator" element={<AIEstimator />} />
            <Route path="/price-history" element={<PriceHistory />} />
            <Route path="/area-ratings" element={<AreaRatings />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/list-property" element={<ProtectedRoute><ListProperty /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
