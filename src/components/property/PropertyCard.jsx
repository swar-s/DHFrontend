function PropertyCard({ property }) {
  const features = {
    pool: '🏊‍♂️ Pool',
    poolFacing: '🏊‍♂️ Pool Facing',
    beach: '🏖️ Beach',
    beachFacing: '🏖️ Beach Facing',
    garden: '🌳 Garden',
    gardenFacing: '🌳 Garden Facing',
    gym: '💪 Gym',
    parking: '🚗 Parking'
  };

  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm">
          {property.bhk} BHK
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-bold text-gray-900">{property.title}</h3>
        <p className="text-gray-600 text-sm mt-1">{property.location}</p>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{property.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xl font-bold text-blue-600">₹{property.price.toLocaleString()}/month</p>
          <p className="text-gray-600">{property.size} sq.ft</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(features).map(([key, value]) => (
            property[key] && (
              <span 
                key={key} 
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {value}
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export default PropertyCard; 