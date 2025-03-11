import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    dob: '',
    location: '',
    userType: 'customer'
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "mobile") {
      if (!/^\d{0,10}$/.test(value)) return; // Allow only up to 10 digits
    }
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
  
    if (name === "password") {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(value)) {
        toast.error("Password must be 8-16 characters and alphanumeric.");
      }
    }
  
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        toast.error("Passwords do not match.");
      }
    }
  
    if (name === "dob") {
      const today = new Date();
      const dobDate = new Date(value);
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 18) {
        toast.error("You must be at least 18 years old to register.");
      }
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const endpoint = formData.userType === 'landlord' 
        ? 'https://desihatti-production.up.railway.app/api/landlords/register'
        : 'https://desihatti-production.up.railway.app/api/customers/register';

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mob: formData.mobile,
        dob: formData.dob,
        location: formData.location
      };

      const response = await axios.post(endpoint, userData);

      if (response.data) {
        const user = {
          ...response.data,
          userType: formData.userType
        };
        login(user);
        toast.success('Registration successful!');
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email already exists');
        toast.error('Email already registered');
      } else {
        setError('Failed to register');
        toast.error('Registration failed');
      }
    }
  };

  const renderField = (name, label, type = 'text', icon, required = true) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none">
        {icon}
      </div>
      {/* <input
        name={name}
        type={type}
        required={required}
        value={formData[name]}
        onChange={handleChange}
        className="appearance-none relative block w-full pl-7 pr-2 py-2 border border-gray-300 
                 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                 focus:border-[#B22222] sm:text-sm transition-colors duration-200"
        placeholder={label}
      /> */}

        <input
          name="mobile"
          type="tel"
          required
          value={formData.mobile}
          onChange={handleChange}
          className="appearance-none relative block w-full pl-7 pr-2 py-2 border border-gray-300 
                  placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                  focus:border-[#B22222] sm:text-sm transition-colors duration-200"
          placeholder="Mobile Number"
        />

          <input
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur} // Triggers validation only when the user leaves the field
            className="appearance-none relative block w-full pl-7 pr-2 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:border-[#B22222] sm:text-sm transition-colors duration-200"
            placeholder="Password"
          />

          <input
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur} // Validates only when the user moves out of the field
            className="appearance-none relative block w-full pl-7 pr-2 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:border-[#B22222] sm:text-sm transition-colors duration-200"
            placeholder="Confirm Password"
          />

            <input
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleChange}
              onBlur={handleBlur} // Ensures the user is at least 18 years old
              className="appearance-none relative block w-full pl-7 pr-2 py-2 border border-gray-300 
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:border-[#B22222] sm:text-sm transition-colors duration-200"
              placeholder="Date of Birth"
            />




    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our community today
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          {['customer', 'landlord'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none
                ${formData.userType === type 
                  ? 'bg-[#B22222] text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B22222]'
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Common Fields */}
            {renderField('name', 'Full Name', 'text', <FiUser className="h-5 w-5 text-gray-400" />)}
            {renderField('email', 'Email address', 'email', <FiMail className="h-5 w-5 text-gray-400" />)}
            {renderField('mobile', 'Mobile Number', 'tel', <FiPhone className="h-5 w-5 text-gray-400" />)}
            {renderField('password', 'Password', 'password', <FiLock className="h-5 w-5 text-gray-400" />)}
            {renderField('confirmPassword', 'Confirm Password', 'password', <FiLock className="h-5 w-5 text-gray-400" />)}

            {/* Customer-specific Fields */}
            {formData.userType === 'customer' && (
              <>
                {renderField('dob', 'Date of Birth', 'date', <FiCalendar className="h-5 w-5 text-gray-400" />)}
                {renderField('location', 'Location (Optional)', 'text', <FiMapPin className="h-5 w-5 text-gray-400" />, false)}
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                       text-sm font-medium rounded-md text-white bg-[#B22222] hover:bg-[#8B1A1A] 
                       focus:outline-none transition-all duration-200"
            >
              Create Account
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#B22222] hover:text-[#8B1A1A]">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 