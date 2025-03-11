import ChatBox from '../chat/ChatBox';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Desi Hatti</h3>
            <p className="text-gray-400">
              Find your perfect rental property with ease.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
              <li><a href="/properties" className="text-gray-400 hover:text-white">Properties</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Property Types</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">1 BHK</a></li>
              <li><a href="/" className="text-gray-400 hover:text-white">2 BHK</a></li>
              <li><a href="/" className="text-gray-400 hover:text-white">3 BHK</a></li>
              <li><a href="/" className="text-gray-400 hover:text-white">Luxury Villas</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@desihatti.com</li>
              <li>Phone: +91 123 456 7890</li>
              <li>Address: Sector 48, Gurugram, Haryana, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-4 pt-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Desi Hatti. All rights reserved.</p>
        </div>
      </div>
      <ChatBox />
    </footer>
  );
}

export default Footer; 