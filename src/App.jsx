import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLogin from './components/auth/AdminLogin';
import CustomerDashboard from './components/dashboard/CustomerDashboard';
import LandlordDashboard from './components/dashboard/LandlordDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import PropertyList from './components/property/PropertyList';
import PropertyForm from './components/property/PropertyForm';
import PropertyDetails from './components/property/PropertyDetails';
import UserProfile from './components/profile/UserProfile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandlordProperties from './components/property/LandlordProperties';
import AboutUs from './components/pages/AboutUs';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PropertyList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sysadmin" element={<AdminLogin />} />
              <Route path="/about" element={<AboutUs />} />

              {/* Protected Customer Routes */}
              <Route 
                path="/dashboard/customer" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Landlord Routes */}
              <Route 
                path="/dashboard/landlord" 
                element={
                  <ProtectedRoute allowedRoles={['landlord']}>
                    <LandlordDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/property/new" 
                element={
                  <ProtectedRoute allowedRoles={['landlord']}>
                    <PropertyForm />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Property Details Route */}
              <Route path="/property/:id" element={<PropertyDetails />} />

              {/* Profile Route */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'landlord', 'admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Landlord Properties Route */}
              {/* <Route 
                path="/dashboard/landlord/properties" 
                element={
                  <ProtectedRoute allowedRoles={['landlord']}>
                    <LandlordProperties />
                  </ProtectedRoute>
                } 
              /> */}
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" autoClose={2000}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 