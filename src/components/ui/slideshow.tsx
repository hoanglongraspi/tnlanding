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
      <div className={`relative overflow-hidden ${showFrame ? 'p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl' : 'rounded-lg'} ${className}`}>
        <img
          src={images[0]}
          alt={title || 'Image'}
          className={`w-full h-full object-cover ${showFrame ? 'rounded-xl shadow-lg' : ''}`}
        />
      </div>
    );
  }

  return (
    <div className={`relative group ${showFrame ? 'p-4 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl' : 'rounded-lg'} ${className}`}>
      {/* Elegant Frame Effects */}
      {showFrame && (
        <>
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-blue-500/20 to-orange-500/20 rounded-3xl blur-sm opacity-60"></div>
          {/* Inner frame shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
        </>
      )}

      {/* Main Image Container */}
      <div className={`relative overflow-hidden ${showFrame ? 'rounded-2xl shadow-2xl' : 'rounded-lg'}`}>
        <img
          src={images[currentIndex]}
          alt={title ? `${title} - Image ${currentIndex + 1}` : `Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-700 ease-out"
        />
        
        {/* Enhanced Gradient Overlay for Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20 pointer-events-none"></div>
      </div>

      {/* Enhanced Navigation Controls */}
      {showControls && (
        <>
          <Button
            onClick={goToPrevious}
            size="sm"
            variant="ghost"
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md shadow-lg hover:scale-110 w-12 h-12 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={goToNext}
            size="sm"
            variant="ghost"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md shadow-lg hover:scale-110 w-12 h-12 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Enhanced Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md shadow-lg hover:scale-110 w-10 h-10 rounded-full"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
        </>
      )}

      {/* Enhanced Slide Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 backdrop-blur-sm hover:scale-125 ${
                index === currentIndex
                  ? 'w-8 h-3 bg-white rounded-full shadow-lg'
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80 rounded-full shadow-md'
              }`}
            >
              {/* Active indicator glow */}
              {index === currentIndex && (
                <div className="absolute -inset-1 bg-white/30 rounded-full blur-sm"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Enhanced Image Counter */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Title overlay (if provided) */}
      {title && (
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 font-medium max-w-xs truncate">
          {title}
        </div>
      )}
    </div>
  );
};

export default Slideshow; 