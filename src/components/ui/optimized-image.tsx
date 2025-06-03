import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  enableWebP?: boolean;
}

// Helper function to check WebP support
const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Helper function to get WebP version of image
const getWebPUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;
  
  // Remove leading slash if present
  const cleanUrl = originalUrl.startsWith('/') ? originalUrl.slice(1) : originalUrl;
  
  // Get file name without extension
  const lastDotIndex = cleanUrl.lastIndexOf('.');
  if (lastDotIndex === -1) return originalUrl;
  
  const nameWithoutExtension = cleanUrl.substring(0, lastDotIndex);
  const extension = cleanUrl.substring(lastDotIndex);
  
  // Only convert common image formats
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
  if (!supportedFormats.includes(extension)) {
    return originalUrl;
  }
  
  // Return WebP URL
  return `/${nameWithoutExtension}.webp`;
};

export const OptimizedImage = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder-image.webp',
  loading = 'lazy',
  priority = false,
  enableWebP = true,
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : '');
  const [imageLoaded, setImageLoaded] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Try WebP first if supported and enabled
            if (enableWebP && supportsWebP && !webpFailed) {
              const webpUrl = getWebPUrl(src);
              setImageSrc(webpUrl);
            } else {
              setImageSrc(src);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px', // Load images 50px before they come into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority, isInView, enableWebP, webpFailed]);

  // Set initial image source for priority images
  useEffect(() => {
    if (priority) {
      if (enableWebP && supportsWebP && !webpFailed) {
        const webpUrl = getWebPUrl(src);
        setImageSrc(webpUrl);
      } else {
        setImageSrc(src);
      }
    }
  }, [src, priority, enableWebP, webpFailed]);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // If WebP failed and we haven't tried the original yet
    if (enableWebP && !webpFailed && imageSrc.endsWith('.webp')) {
      console.log(`WebP failed for ${imageSrc}, falling back to original format`);
      setWebpFailed(true);
      setImageSrc(src);
      return;
    }
    
    // If original image failed, try fallback
    if (!hasError && imageSrc !== fallbackSrc) {
      console.log(`Original image failed for ${imageSrc}, using fallback`);
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
      return;
    }
    
    // All options failed
    console.error(`All image sources failed for ${alt}`);
    onError?.();
  };

  // Preload the image
  useEffect(() => {
    if (imageSrc && !imageLoaded) {
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = imageSrc;
    }
  }, [imageSrc, imageLoaded]);

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Actual Image */}
      {imageSrc && (
        <picture>
          {/* WebP source for modern browsers */}
          {enableWebP && supportsWebP && !webpFailed && !imageSrc.endsWith('.webp') && (
            <source 
              srcSet={getWebPUrl(imageSrc)} 
              type="image/webp" 
            />
          )}
          
          {/* Fallback for all browsers */}
          <img
            src={imageSrc}
            alt={alt}
            loading={loading}
            className={cn(
              'transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            decoding="async"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </picture>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && imageLoaded && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          {imageSrc.endsWith('.webp') ? '📦 WebP' : '📷 Original'}
          {webpFailed && ' (WebP failed)'}
        </div>
      )}
    </div>
  );
}; 