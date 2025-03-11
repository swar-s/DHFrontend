import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Spacer div - increased height */}
      <div className="h-20"></div>
      
      {/* Navbar - increased height */}
      <nav className="bg-[#B22222] text-white fixed w-full top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo Only */}
            <Link 
              to="/" 
              className="flex items-center focus:outline-none focus:ring-0 active:outline-none"
            >
              <img 
                src="/logo.png"
                alt="Desi Hatti Logo"
                className="h-14 w-auto select-none"
                draggable="false"
              />
              <span className="ml-2 text-white font-bold md:text-2xl text-sm">Desi Hatti</span>
            </Link>

            {/* Rest of navbar items */}
            <div className="space-x-4 flex items-center">
              {user ? (
                <>
                  {/* Show "List Property" button for landlords */}
                  {user.userType === 'landlord' && (
                    <Link 
                      to="/property/new" 
                      className="bg-white text-[#B22222] px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150 focus:outline-none"
                    >
                      List Property
                    </Link>
                  )}

                  {/* User Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-1 hover:text-gray-200 focus:outline-none"
                    >
                      <span>{user.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700 z-50">
                        
                        
                        

                        {user.userType === 'customer' && (
                          <Link
                            to="/dashboard/customer"
                            className="block px-4 py-2 hover:bg-gray-100 focus:outline-none"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            My Bookings
                          </Link>
                        )}

                        {user.userType === 'landlord' && (
                          <Link
                            to="/dashboard/landlord"
                            className="block px-4 py-2 hover:bg-gray-100 focus:outline-none"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            My Properties
                          </Link>
                        )}

                        {user.userType === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 hover:bg-gray-100 focus:outline-none"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Approve Properties
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 focus:outline-none"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-lg font-medium hover:text-gray-200 transition-colors duration-150 px-4 py-2 focus:outline-none"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-lg font-medium bg-white text-[#B22222] px-6 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150 focus:outline-none"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar; 