import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar'
import Footer from './components/footer';
import { AuthProvider } from './context/AuthContext';
import StructuredData from './components/SEO/StructuredData';
import ScrollToTop from './components/ScrollToTop';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./components/properties/propertydetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./components/login'));
const Signup = lazy(() => import('./components/signup'));
const ForgotPassword = lazy(() => import('./components/forgetpassword'));
const ResetPassword = lazy(() => import('./components/resetpassword'));
const NotFoundPage = lazy(() => import('./components/Notfound'));
const AIPropertyHub = lazy(() => import('./pages/Aiagent'));
const NeighborhoodAnalysis = lazy(() => import('./pages/NeighborhoodAnalysis'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const UserAddProperty = lazy(() => import('./pages/UserAddProperty'));
const UserProperties = lazy(() => import('./pages/UserProperties'));
const UserUpdateProperty = lazy(() => import('./pages/UserUpdateProperty'));
const UserAppointments = lazy(() => import('./pages/UserAppointments'));
const PropertyMap = lazy(() => import('./pages/PropertyMap'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);


export const Backendurl = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  return (
    <HelmetProvider>
    <AuthProvider>
    <Router>
      {/* Base website structured data */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <ScrollToTop />
      
      <Navbar />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/single/:id" element={<PropertyDetails />} />
        <Route path="/map" element={<PropertyMap />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-property-hub" element={<AIPropertyHub />} />
        <Route path="/neighborhood-analysis" element={<NeighborhoodAnalysis />} />
        <Route path="/property-map" element={<PropertyMap />} />
        
        {/* User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* User Management Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserDashboard />}>
            <Route path="/user/add-property" element={<UserAddProperty />} />
            <Route path="/user/properties" element={<UserProperties />} />
            <Route path="/user/update-property/:id" element={<UserUpdateProperty />} />
            <Route path="/user/appointments" element={<UserAppointments />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        
      </Routes>
      </Suspense>
      <Footer />
      <ToastContainer />
    </Router>
    </AuthProvider>
    </HelmetProvider>
  )
}

export default App