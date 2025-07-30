import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: 'low' | 'medium' | 'high';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  aspectRatio?: string;
}

const LazyImage = React.memo<LazyImageProps>(({
  src,
  alt,
  className,
  placeholder = '/placeholder.webp',
  quality = 'medium',
  priority = false,
  onLoad,
  onError,
  sizes = '100vw',
  aspectRatio = 'auto',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState(priority ? src : '');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, inView]);

  // Set image source when in view
  useEffect(() => {
    if (inView && !imageSrc) {
      setImageSrc(src);
    }
  }, [inView, src, imageSrc]);

  // Generate optimized src with quality and format
  const getOptimizedSrc = useCallback((url: string) => {
    if (!url) return '';
    
    // If already WebP, return as is
    if (url.includes('.webp')) return url;
    
    // Auto-convert to WebP for better compression
    const extension = url.split('.').pop();
    if (['jpg', 'jpeg', 'png'].includes(extension?.toLowerCase() || '')) {
      return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return url;
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(false);
    if (imgRef.current && imageSrc !== placeholder) {
      setImageSrc(placeholder);
    }
    onError?.();
  }, [onError, placeholder, imageSrc]);

  const getQualityClass = () => {
    switch (quality) {
      case 'low': return 'image-rendering-auto';
      case 'high': return 'image-rendering-crisp-edges';
      default: return 'image-rendering-auto';
    }
  };

  return (
    <div 
      ref={imgRef} 
      className={cn('relative overflow-hidden bg-gray-800', className)}
      style={{ aspectRatio }}
    >
      {/* Skeleton placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Failed to load</div>
        </div>
      )}

      {/* Main image */}
      {imageSrc && (
        <picture>
          <source 
            srcSet={getOptimizedSrc(imageSrc)} 
            type="image/webp" 
            sizes={sizes}
          />
          <img
            src={imageSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
              getQualityClass()
            )}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
          />
        </picture>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage; 