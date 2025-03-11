import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock } from 'react-icons/fi';
import { motion } from "framer-motion";
import ParticleBackground from '../ui/ParticleBackground';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let endpoint;
      if (userType === 'customer') {
        endpoint = 'https://desihatti-production.up.railway.app/api/customers/login';
      } else if (userType === 'landlord') {
        endpoint = 'https://desihatti-production.up.railway.app/api/landlords/login';
      } else {
        toast.error('Invalid user type');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.post(endpoint, {
        email,
        password
      });
      
      // If login is successful
      const userData = {
        ...response.data,
        userType
      };
      
      login(userData);
      toast.success(`Welcome back!`);
      
      if (userType === 'customer') {
        navigate('/');
      } else {
        navigate('/dashboard/landlord');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <ParticleBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg relative z-10"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setUserType('customer')}
              className={`px-4 py-2 rounded-md ${
                userType === 'customer' 
                  ? 'bg-[#B22222] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setUserType('landlord')}
              className={`px-4 py-2 rounded-md ${
                userType === 'landlord' 
                  ? 'bg-[#B22222] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Landlord
            </button>
          </div>
        </div>
        
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-7 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#B22222] focus:border-[#B22222] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-7 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#B22222] focus:border-[#B22222] focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#B22222] hover:bg-[#8B1A1A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22222]"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </motion.div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              {userType === 'customer' ? (
                <Link to="/register" className="font-medium text-[#B22222] hover:text-[#8B1A1A]">
                  Register as Customer
                </Link>
              ) : (
                <Link to="/register" className="font-medium text-[#B22222] hover:text-[#8B1A1A]">
                  Register as Landlord
                </Link>
              )}
            </p>
          </div>
        </motion.form>

        {/* Admin access link */}
        <div className="mt-2 text-xs text-center">
          <Link to="/sysadmin" className="text-gray-500 hover:text-gray-800">
            Admin Access
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login; 