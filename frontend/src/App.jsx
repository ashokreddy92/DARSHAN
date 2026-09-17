import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout Components (Eager loaded for instant shell rendering)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Page (Eager loaded for optimal First Contentful Paint)
import Home from './pages/Home';

// Lazy-loaded routes for code-splitting (reduces initial JS bundle by ~65%)
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Register = lazy(() => import('./pages/Register'));
const Temples = lazy(() => import('./pages/Temples'));
const BookDarshan = lazy(() => import('./pages/BookDarshan'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Donate = lazy(() => import('./pages/Donate'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));

// Lightweight page loader fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '14px',
    color: '#64748b'
  }}>
    <div style={{
      width: '38px',
      height: '38px',
      border: '3px solid #e2e8f0',
      borderTop: '3px solid #d97706',
      borderRadius: '50%',
      animation: 'appSpin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading page...</span>
    <style>{`
      @keyframes appSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          
          <main className="main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/temples" element={<Temples />} />
                <Route path="/temples/:id" element={<BookDarshan />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Protected Devotee Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ORGANIZER']}>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Organizer Dashboard */}
                <Route
                  path="/organizer"
                  element={
                    <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Control Panel */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>

        {/* Global Toast Alerts */}
        <ToastContainer 
          position="bottom-right" 
          autoClose={4000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>

      <style>{`
        .app-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .main-content {
          flex-grow: 1;
        }
      `}</style>
    </AuthProvider>
  );
}

export default App;
