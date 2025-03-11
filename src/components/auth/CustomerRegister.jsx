import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CustomerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mob: '',
    password: '',
    confirmPassword: '',
    dob: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "mob") {
      if (!/^\d{0,10}$/.test(value)) return; // Only allow up to 10 digits
    }

  
    if (name === "dob") {
      const today = new Date();
      const dobDate = new Date(value);
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 18) {
        toast.error("You must be at least 18 years old to register.");
        return;
      }
    }
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(value)) {
        toast.error("Please enter a valid email address.");
      }
    }
  
    if (name === "password" || name === "confirmPassword") {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(value)) {
        toast.error("Password must be 8-16 characters and alphanumeric.");
      }
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      const response = await axios.post('https://desihatti-production.up.railway.app/api/customers/register', {
        name: formData.name,
        email: formData.email,
        mob: formData.mob,
        password: formData.password,
        dob: formData.dob,
        location: formData.location
      });
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error('Email already exists. Please use a different email.');
      } else {
        console.error('Registration error:', error);
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-6">
          Create Your Customer Account
        </h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <label htmlFor="mob" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              id="mob"
              name="mob"
              type="tel"
              required
              value={formData.mob}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B22222] focus:border-[#B22222]"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#B22222] hover:bg-[#8B1A1A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22222]"
            >
              Register
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#B22222] hover:text-[#8B1A1A]">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerRegister; 