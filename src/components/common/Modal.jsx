import React, { useEffect } from 'react';

function Modal({ show, onClose, children }) {
  useEffect(() => {
    // Prevent body scrolling when modal is open
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Clean up
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal; 