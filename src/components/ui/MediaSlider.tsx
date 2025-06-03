import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';

interface MediaSliderProps {
  videoUrl?: string;
  thumbnailUrl: string;
  images?: string[];
  title: string;
  className?: string;
}

const MediaSlider = ({ videoUrl, thumbnailUrl, images = [], title, className = "" }: MediaSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Create media array: video first (if exists), then thumbnail, then additional images
  const mediaItems = [];
  
  if (videoUrl) {
    mediaItems.push({ type: 'video', url: videoUrl, title: `${title} - Video` });
  }
  
  // Always include thumbnail as first image
  mediaItems.push({ type: 'image', url: thumbnailUrl, title: `${title} - Main Image` });
  
  // Add additional images
  images.forEach((imageUrl, index) => {
    if (imageUrl.trim()) {
      mediaItems.push({ type: 'image', url: imageUrl, title: `${title} - Image ${index + 2}` });
    }
  });

  const totalItems = mediaItems.length;
  const currentItem = mediaItems[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (totalItems === 0) {
    return (
      <div className={`aspect-video bg-gray-800 rounded-2xl flex items-center justify-center ${className}`}>
        <ImageIcon className="w-16 h-16 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Media Display */}
      <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden relative">
        {currentItem.type === 'video' ? (
          <iframe
            src={currentItem.url}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 'none' }}
            title={currentItem.title}
          />
        ) : (
          <img
            src={currentItem.url}
            alt={currentItem.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/project-thumbnail.webp';
            }}
          />
        )}

        {/* Navigation Arrows - Only show if more than 1 item */}
        {totalItems > 1 && (
          <>
            <Button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm"
              size="sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm"
              size="sm"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Media Type Indicator */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-2">
            {currentItem.type === 'video' ? (
              <>
                <Play className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Video</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Photo</span>
              </>
            )}
          </div>
        </div>

        {/* Counter */}
        {totalItems > 1 && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {totalItems}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dots Navigation - Only show if more than 1 item */}
      {totalItems > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-110'
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
              aria-label={`Go to ${item.type} ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip - Only show if more than 3 items */}
      {totalItems > 3 && (
        <div className="mt-4 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {mediaItems.map((item, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 relative w-20 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                  index === currentIndex
                    ? 'ring-2 ring-blue-500 scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/project-thumbnail.webp';
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSlider; 