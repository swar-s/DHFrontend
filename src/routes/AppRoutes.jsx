import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';
import LandlordDashboard from '../components/dashboard/LandlordDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import PropertyList from '../components/property/PropertyList';
import PropertyForm from '../components/property/PropertyForm';
import PropertyDetails from '../components/property/PropertyDetails';
import UserProfile from '../components/profile/UserProfile';

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

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PropertyList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
        path="/dashboard/admin" 
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

      {/* Catch all - 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes; 