import React from 'react';

function AboutUs() {
  // Helper component for highlighted keywords - more subtle and transparent
  const Highlight = ({ children }) => (
    <span className="bg-[#B22222]/20 text-[#B22222] font-medium px-1.5 py-0.5 rounded-full mx-0.5 inline-block">
      {children}
    </span>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About Desi Hatti</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <div className="flex flex-col md:flex-row items-center mb-10">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <img 
                src="/logo-red.png" 
                alt="Desi Hatti Logo" 
                className="w-80 h-auto mx-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                At Desi Hatti, we're on a mission to <Highlight>revolutionize</Highlight> the way people find and book rental 
                properties in India. We believe that finding your perfect temporary home should be 
                simple, transparent, and <Highlight>stress-free</Highlight>.
              </p>
              <p className="text-gray-700">
                Our platform connects property owners with quality tenants, creating a 
                trustworthy marketplace for short and long-term rentals.
              </p>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2025, Desi Hatti began with a simple observation: the rental process in India
              was unnecessarily complicated and lacked <Highlight>transparency</Highlight>. Our founders experienced firsthand 
              the challenges of finding good rental properties and decided to create a solution.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a small idea has grown into a platform that hosts thousands of properties
              across major Indian cities, helping landlords maximize their rental income and helping 
              tenants find their <Highlight>perfect</Highlight> temporary homes.
            </p>
            <p className="text-gray-700">
              Our name "Desi Hatti" reflects our roots - providing a uniquely Indian solution to 
              the housing rental market, with a touch of traditional hospitality and modern technology.
            </p>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">What Sets Us Apart</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2"><Highlight>Verified</Highlight> Listings</h3>
                <p className="text-gray-700">
                  Every property on our platform goes through a verification process to ensure 
                  quality and accuracy.
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2"><Highlight>Secure</Highlight> Bookings</h3>
                <p className="text-gray-700">
                  Our booking system provides security for both landlords and tenants with 
                  transparent processes.
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2"><Highlight>Customer</Highlight> Support</h3>
                <p className="text-gray-700">
                  Our dedicated team and AI assistant are always ready to help with any questions 
                  or issues.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-gray-700 mb-6">
              Desi Hatti is powered by a passionate team of real estate experts, technology 
              enthusiasts, and customer service professionals who are committed to improving 
              the rental experience in India.
            </p>
            
            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Team Member 1 */}
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <img 
                  src="/mentor.jpeg" 
                  alt="Dr. Arup Abhinna Acharya" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                <h3 className="text-lg font-semibold">Dr. Arup Abhinna Acharya</h3>
                <p className="text-[#B22222] font-medium mb-2"><Highlight>Mentor</Highlight></p>
              </div>
              
              {/* Team Member 2 */}
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <img 
                  src="/Swarup.jpg" 
                  alt="Swarup Suryawanshi" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                <h3 className="text-lg font-semibold">Swarup Suryawanshi</h3>
                <p className="text-[#B22222] font-medium mb-2"><Highlight>Frontend &amp; Database</Highlight></p>
              </div>
              
              {/* Team Member 3 */}
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <img 
                  src="/Saumen.jpg" 
                  alt="Chaudhury Saumen Dash" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                <h3 className="text-lg font-semibold">Chaudhury Saumen Dash</h3>
                <p className="text-[#B22222] font-medium mb-2"><Highlight>Backend &amp; Integration</Highlight></p>
              </div>
              
              {/* Team Member 4 */}
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <img 
                  src="/payal.jpg" 
                  alt="Payal Burmam" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                <h3 className="text-lg font-semibold">Payal Burman</h3>
                <p className="text-[#B22222] font-medium mb-2"><Highlight>Frontend &amp; Deployment</Highlight></p>
              </div>
              
              {/* Team Member 5 */}
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <img 
                  src="/Shibani.jpg" 
                  alt="Shibani Sarkar" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                <h3 className="text-lg font-semibold">Shibani Sarkar</h3>
                <p className="text-[#B22222] font-medium mb-2"><Highlight>Backend</Highlight></p>
              </div>
              
              {/* Team Member 6 */}
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <img 
                  src="/abhijeet.png" 
                  alt="Abhijeet Kumar" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                <h3 className="text-lg font-semibold">Abhijeet Kumar</h3>
                <p className="text-[#B22222] font-medium mb-2"><Highlight>Backend</Highlight></p>
              </div>
            </div>
            
            <div className="text-center">
              <a 
                href="mailto:swarupsuryawanshi4911@gmail.com" 
                className="inline-block bg-[#B22222] text-white px-6 py-3 rounded-md hover:bg-[#8B1A1A] transition-colors"
              >
                Get in Touch With Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs; 