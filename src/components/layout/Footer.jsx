import ChatBox from '../chat/ChatBox';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h3 className="text-lg font-bold">Desi Hatti</h3>
            <p className="text-sm text-gray-400">Find your perfect rental property</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap justify-center gap-4 md:gap-8">
            <Link to="/" className="text-gray-400 hover:text-white text-sm">Home</Link>
            <Link to="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link>
            <Link to="/" className="text-gray-400 hover:text-white text-sm">Properties</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-4 pt-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Desi Hatti. All rights reserved.</p>
        </div>
      </div>
      <ChatBox />
    </footer>
  );
}

export default Footer;