import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaCheck, FaTimes, FaHome, FaUsers, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();
  const [pendingProperties, setPendingProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    totalLandlords: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchPendingProperties();
    fetchStatistics();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching pending properties...');
      
      const response = await axios.get('https://desihatti-production.up.railway.app/api/admin/properties/pending', {
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && Array.isArray(response.data.content)) {
        setPendingProperties(response.data.content);
        console.log('Pending properties set:', response.data.content);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
      toast.error(`Failed to load properties: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // In a production app, this would fetch from the backend statistics endpoint
      const response = await axios.get('https://desihatti-production.up.railway.app/api/admin/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback to sample data if API fails
      setStats({
        totalProperties: 150,
        pendingProperties: pendingProperties.length,
        totalLandlords: 45,
        totalCustomers: 210,
        totalBookings: 320,
        totalRevenue: 450000
      });
    }
  };

  const handleApproveProperty = async (pid) => {
    try {
      console.log('Approving property:', pid);
      const response = await axios.put(`https://desihatti-production.up.railway.app/api/admin/properties/${pid}/approve?approved=true`);
      console.log('Approve response:', response.data);
      toast.success('Property approved successfully');
      fetchPendingProperties(); // Refresh the list
    } catch (error) {
      console.error('Error approving property:', error);
      toast.error(`Failed to approve property: ${error.message}`);
    }
  };

  // const handleRejectProperty = async (pid) => {
  //   try {
  //     await axios.put(`https://desihatti-production.up.railway.app/api/admin/properties/${pid}/approve?approved=false`, null, {
  //       params: { approved: false }
  //     });
  //     toast.success('Property rejected');
  //     // Refresh the property list
  //     fetchPendingProperties();
  //     fetchStatistics();
  //   } catch (error) {
  //     console.error('Error rejecting property:', error);
  //     toast.error('Failed to reject property');
  //   }
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaHome className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500 mr-4">
              <FaHome className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold">{pendingProperties.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalCustomers + stats.totalLandlords}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaCalendarCheck className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending Properties Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Properties Pending Approval</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading properties...</p>
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="text-center py-4">
            <p>No properties pending approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Landlord
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingProperties.map((property) => (
                  <tr key={property.pid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/property/${property.pid}`}>
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        </Link>

                      <div className="text-sm text-gray-500">{property.bhk} BHK, {property.size} sqft</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.landlord?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{property.landlord?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.city}</div>
                      <div className="text-sm text-gray-500">{property.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{property.price}/day</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {property.ptype || 'Apartment'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveProperty(property.pid)}
                          className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                        >
                          <FaCheck className="mr-1" /> Approve
                        </button>
                        {/* <button
                          onClick={() => handleRejectProperty(property.pid)}
                          className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <FaTimes className="mr-1" /> Reject
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 