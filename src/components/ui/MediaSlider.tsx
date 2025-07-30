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

  // Create media array: video first (if exists), then additional images
  // Do NOT include thumbnailUrl as it's just a representative image, not part of the gallery
  const mediaItems = [];
  
  if (videoUrl) {
    mediaItems.push({ type: 'video', url: videoUrl, title: `${title} - Video` });
  }
  
  // Add additional images (exclude thumbnail from slideshow)
  images.forEach((imageUrl, index) => {
    if (imageUrl.trim()) {
      mediaItems.push({ type: 'image', url: imageUrl, title: `${title} - Image ${index + 1}` });
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

  // If no media items (no video and no images), show the thumbnail as fallback
  if (totalItems === 0) {
    return (
      <div className={`aspect-video bg-gray-800 rounded-2xl overflow-hidden relative ${className}`}>
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/project-thumbnail.webp';
          }}
        />
        <div className="absolute top-4 left-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Thumbnail</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
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

        {/* Enhanced Navigation Arrows - Only show if more than 1 item */}
        {totalItems > 1 && (
          <>
            {/* Previous Button - Enhanced Styling */}
            <Button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black/95 text-white border-2 border-white/30 hover:border-white/50 opacity-70 hover:opacity-100 transition-all duration-300 backdrop-blur-md shadow-2xl hover:scale-110 w-12 h-12 rounded-full group-hover:left-4 z-10"
              size="sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Next Button - Enhanced Styling */}
            <Button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black/95 text-white border-2 border-white/30 hover:border-white/50 opacity-70 hover:opacity-100 transition-all duration-300 backdrop-blur-md shadow-2xl hover:scale-110 w-12 h-12 rounded-full group-hover:right-4 z-10"
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

        {/* Keyboard Navigation Hint - Show on hover */}
        {totalItems > 1 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500">
            <div className="flex items-center space-x-6 text-white/70 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-white/10 rounded border border-white/20 flex items-center justify-center">
                  <ChevronLeft className="w-2.5 h-2.5" />
                </div>
                <span>Prev</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Next</span>
                <div className="w-5 h-5 bg-white/10 rounded border border-white/20 flex items-center justify-center">
                  <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Dots Navigation - Only show if more than 1 item */}
      {totalItems > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 hover:scale-125 ${
                index === currentIndex
                  ? 'w-6 h-3 bg-blue-500 rounded-full shadow-lg'
                  : 'w-3 h-3 bg-gray-500 hover:bg-gray-400 rounded-full shadow-md'
              }`}
              aria-label={`Go to ${item.type} ${index + 1}`}
            >
              {/* Active indicator glow */}
              {index === currentIndex && (
                <div className="absolute -inset-1 bg-blue-500/30 rounded-full blur-sm"></div>
              )}
            </button>
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