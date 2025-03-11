import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import axios from 'axios';

function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [property, setProperty] = useState({
    title: '',
    description: '',
    ptype: 'apartment',
    size: '',
    bhk: 1,
    city: '',
    address: '',
    pool: false,
    poolFacing: false,
    beach: false,
    beachFacing: false,
    garden: false,
    gardenFacing: false,
    gameZone: false,
    wifi: false,
    parking: false,
    gym: false,
    price: '',
    landlord: {
      lid: user?.lid || ''
    }
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await axios.get(`https://desihatti-production.up.railway.app/api/properties/${id}`);
      setProperty(response.data);
      
      // Fetch property images
      const imagesResponse = await axios.get(`https://desihatti-production.up.railway.app/api/property-images/${id}`);
      if (imagesResponse.data.length > 0) {
        setPreviewUrl(imagesResponse.data[0].imageURL);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to fetch property details');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setProperty(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : (name === 'bhk' || name === 'price' || name === 'size')
          ? Number(value)
          : (name === 'city')
            ? value.toLowerCase()
            : value
    }));
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.lid) {
      toast.error('You must be logged in as a landlord to add a property');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a properly formatted property object
      const propertyData = {
        ...property,
        // Ensure numeric fields are numbers
        size: Number(property.size),
        bhk: Number(property.bhk),
        price: Number(property.price),
        // Ensure landlord is properly set
        landlord: {
          lid: user.lid
        }
      };
      
      console.log("Sending property data:", propertyData); // Debug log
      
      let response;
      
      if (id && id !== 'new') {
        // Update existing property
        response = await axios.put(`https://desihatti-production.up.railway.app/api/properties/${id}`, propertyData);
        toast.success('Property updated successfully');
      } else {
        // Create new property
        response = await axios.post('https://desihatti-production.up.railway.app/api/properties', propertyData);
        toast.success('Property added successfully');
      }
      
      const savedProperty = response.data;
      
      // Upload image if selected
      if (selectedFile) {
        await uploadPropertyImage(savedProperty.pid);
      }
      
      navigate('/dashboard/landlord');
    } catch (error) {
      console.error('Error saving property:', error);
      console.error('Response data:', error.response?.data); // Log the response data
      toast.error('Failed to save property: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPropertyImage = async (propertyId) => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('pid', propertyId);
      
      await axios.post('https://desihatti-production.up.railway.app/api/property-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Property image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload property image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {id && id !== 'new' ? 'Edit Property' : 'Add New Property'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={property.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={property.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                name="ptype"
                value={property.ptype}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                required
              >
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
                <option value="villa">Villa</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size (sq.ft)</label>
                <input
                  type="number"
                  name="size"
                  value={property.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
                <select
                  name="bhk"
                  value={property.bhk}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                  required
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹ per day)</label>
              <input
                type="number"
                name="price"
                value={property.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                required
              />
            </div>
          </div>
          
          {/* Location and Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Location</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={property.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={property.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                required
              />
            </div>
            
            {/* Image Upload Section */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">Property Image</h2>
              
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-600 rounded-md">
                  <FiImage />
                  <span>Select Image</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                
                {selectedFile && (
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <FiX /> Clear
                  </button>
                )}
              </div>
              
              {previewUrl && (
                <div className="mt-4 relative">
                  <img 
                    src={previewUrl} 
                    alt="Property preview" 
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-semibold border-b pb-2 mt-6">Amenities</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'pool', label: 'Pool' },
                { name: 'poolFacing', label: 'Pool Facing' },
                { name: 'beach', label: 'Beach' },
                { name: 'beachFacing', label: 'Beach Facing' },
                { name: 'garden', label: 'Garden' },
                { name: 'gardenFacing', label: 'Garden Facing' },
                { name: 'gameZone', label: 'Game Zone' },
                { name: 'wifi', label: 'WiFi' },
                { name: 'parking', label: 'Parking' },
                { name: 'gym', label: 'Gym' }
              ].map(amenity => (
                <div key={amenity.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={amenity.name}
                    name={amenity.name}
                    checked={property[amenity.name]}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#B22222] focus:ring-[#B22222] border-gray-300 rounded"
                  />
                  <label htmlFor={amenity.name} className="ml-2 block text-sm text-gray-700">
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard/landlord')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className={`px-4 py-2 bg-[#B22222] text-white rounded-md hover:bg-[#8B1A1A] ${
              (isLoading || isUploading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading || isUploading ? 'Saving...' : (id && id !== 'new' ? 'Update Property' : 'Add Property')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyForm; 