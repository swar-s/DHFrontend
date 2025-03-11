import { useState } from 'react';

function ImageGallery({ images }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative mb-6">
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <img
            src={images[currentImageIndex]}
            alt={`Property view ${currentImageIndex + 1}`}
            className="w-full h-[400px] object-cover rounded-lg cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Thumbnail Strip */}
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={`cursor-pointer relative ${
                index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-20 object-cover rounded-md"
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative max-w-7xl mx-auto p-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
            >
              ✕
            </button>

            <img
              src={images[currentImageIndex]}
              alt={`Property view ${currentImageIndex + 1}`}
              className="max-h-[90vh] w-auto mx-auto"
            />

            <div className="absolute left-4 right-4 bottom-4 flex justify-center space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/75"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/75"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery; 