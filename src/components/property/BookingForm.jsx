import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function BookingForm() {
  const { user } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check user type before allowing booking
    if (!user || user.userType !== 'customer') {
      toast.error('Only customers can book properties');
      return;
    }

    // ... rest of booking logic
  };

  // ... rest of component
}

export default BookingForm; 