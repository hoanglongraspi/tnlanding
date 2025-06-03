import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from './button';

interface SlideshowProps {
  images: string[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  showControls?: boolean;
  showIndicators?: boolean;
  showFrame?: boolean;
}

const Slideshow: React.FC<SlideshowProps> = ({
  images,
  title,
  autoPlay = false,
  autoPlayInterval = 4000,
  className = '',
  showControls = true,
  showIndicators = true,
  showFrame = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, images.length, autoPlayInterval]);

  // Handle image load to get aspect ratio
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setImageAspectRatio(aspectRatio);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden ${showFrame ? 'p-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl' : 'rounded-lg'} ${className}`}>
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={images[0]}
            alt={title || 'Image'}
            className="w-full h-full object-contain bg-black/20"
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    );
  }

  // Determine optimal container style based on image aspect ratio
  const getContainerStyle = () => {
    if (!imageAspectRatio) return {};
    
    // For very wide images (panoramic)
    if (imageAspectRatio > 2.5) {
      return {
        maxHeight: '60vh',
        width: '100%'
      };
    }
    // For very tall images (portrait)
    else if (imageAspectRatio < 0.7) {
      return {
        maxWidth: '60vw',
        height: '85vh'
      };
    }
    // For standard landscape/square images
    else {
      return {
        maxWidth: '90vw',
        maxHeight: '80vh'
      };
    }
  };

  return (
    <div className={`relative group ${showFrame ? 'p-3 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl' : 'rounded-lg'} ${className}`} style={getContainerStyle()}>
      {/* Elegant Frame Effects */}
      {showFrame && (
        <>
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/15 via-blue-500/15 to-orange-500/15 rounded-2xl blur-sm opacity-40"></div>
          {/* Inner frame shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/3 via-transparent to-white/3 rounded-2xl pointer-events-none"></div>
        </>
      )}

      {/* Main Image Container */}
      <div className={`relative overflow-hidden ${showFrame ? 'rounded-xl shadow-xl' : 'rounded-lg'} bg-black/10`}>
        <img
          src={images[currentIndex]}
          alt={title ? `${title} - Image ${currentIndex + 1}` : `Image ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-opacity duration-500 ease-out"
          onLoad={handleImageLoad}
          style={{
            minHeight: '300px',
            maxHeight: showFrame ? 'calc(80vh - 2rem)' : '80vh'
          }}
        />
        
        {/* Enhanced Gradient Overlay for Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>

      {/* Enhanced Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            size="sm"
            variant="ghost"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md shadow-lg hover:scale-110 w-12 h-12 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={goToNext}
            size="sm"
            variant="ghost"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md shadow-lg hover:scale-110 w-12 h-12 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Enhanced Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md shadow-lg hover:scale-110 w-10 h-10 rounded-full"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
        </>
      )}

      {/* Enhanced Slide Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-70 group-hover:opacity-100 transition-all duration-500">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 backdrop-blur-sm hover:scale-125 ${
                index === currentIndex
                  ? 'w-6 h-2 bg-white rounded-full shadow-lg'
                  : 'w-2 h-2 bg-white/60 hover:bg-white/80 rounded-full shadow-md'
              }`}
            >
              {/* Active indicator glow */}
              {index === currentIndex && (
                <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Enhanced Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/20 opacity-70 group-hover:opacity-100 transition-all duration-500 font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Title overlay (if provided) */}
      {title && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 font-medium max-w-xs truncate">
          {title}
        </div>
      )}
    </div>
  );
};

export default Slideshow; 