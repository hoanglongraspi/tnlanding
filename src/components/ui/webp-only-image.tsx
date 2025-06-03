import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { autoWebP, WebPUtils } from '@/lib/webp-auto-converter';

interface WebPOnlyImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  quality?: 'high' | 'medium' | 'low';
  placeholder?: 'blur' | 'skeleton' | 'none';
}

/**
 * WebP-Only Image Component - TN Films
 * Chỉ sử dụng WebP format với tự động convert và tối ưu tối đa
 */
export const WebPOnlyImage = ({
  src,
  alt,
  className,
  loading = 'lazy',
  priority = false,
  quality = 'high',
  placeholder = 'skeleton',
  onLoad,
  onError,
}: WebPOnlyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Auto convert to WebP URL
  const webpSrc = autoWebP(src);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) {
      setImageSrc(webpSrc);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setImageSrc(webpSrc);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [webpSrc, priority, isInView]);

  // Set initial image source for priority images
  useEffect(() => {
    if (priority) {
      setImageSrc(webpSrc);
    }
  }, [webpSrc, priority]);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.warn(`⚠️ WebP failed to load: ${imageSrc}`);
    setHasError(true);
    onError?.();
  };

  // Quality settings for different use cases
  const getQualityClass = () => {
    switch (quality) {
      case 'high': return 'image-rendering: -webkit-optimize-contrast;';
      case 'medium': return 'image-rendering: auto;';
      case 'low': return 'image-rendering: pixelated;';
      default: return '';
    }
  };

  // Placeholder component
  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;
    
    if (placeholder === 'blur') {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>
      );
    }
    
    // Default skeleton
    return (
      <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-gray-500">Loading WebP...</div>
        </div>
      </div>
    );
  };

  // Error state
  const renderError = () => (
    <div className="absolute inset-0 bg-gray-800/90 flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-red-400 text-sm">!</span>
        </div>
        <div className="text-xs text-red-400">WebP Error</div>
      </div>
    </div>
  );

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!imageLoaded && !hasError && renderPlaceholder()}
      
      {/* Error State */}
      {hasError && renderError()}
      
      {/* WebP Image */}
      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          loading={loading}
          className={cn(
            'transition-all duration-500 w-full h-full object-cover',
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            className
          )}
          style={{ 
            imageRendering: quality === 'high' ? '-webkit-optimize-contrast' : 'auto'
          }}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
      
      {/* Performance Badge (Development Only) */}
      {process.env.NODE_ENV === 'development' && imageLoaded && (
        <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <span>📦</span>
            <span>WebP {WebPUtils.estimatedSavings()} lighter</span>
          </div>
        </div>
      )}

      {/* Loading Performance Indicator */}
      {!imageLoaded && imageSrc && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-50">
          🚀 WebP Loading...
        </div>
      )}
    </div>
  );
};

/**
 * Hook để tự động optimize multiple images
 */
export const useWebPOnlyImages = (imageUrls: string[]) => {
  const [optimizedUrls, setOptimizedUrls] = useState<string[]>([]);
  
  useEffect(() => {
    const converted = imageUrls.map(url => autoWebP(url));
    setOptimizedUrls(converted);
  }, [JSON.stringify(imageUrls)]);
  
  return optimizedUrls;
};

/**
 * WebP Gallery Component - Tối ưu cho nhiều ảnh
 */
interface WebPGalleryProps {
  images: Array<{ src: string; alt: string; id?: string }>;
  className?: string;
  columns?: number;
  gap?: number;
  loading?: 'lazy' | 'eager';
}

export const WebPGallery = ({ 
  images, 
  className, 
  columns = 3, 
  gap = 4,
  loading = 'lazy' 
}: WebPGalleryProps) => {
  const optimizedImages = useWebPOnlyImages(images.map(img => img.src));
  
  return (
    <div 
      className={cn(
        'grid auto-rows-fr',
        `grid-cols-1 md:grid-cols-${Math.min(columns, 4)} gap-${gap}`,
        className
      )}
    >
      {images.map((image, index) => (
        <div key={image.id || index} className="aspect-square">
          <WebPOnlyImage
            src={optimizedImages[index] || image.src}
            alt={image.alt}
            loading={index < 6 ? 'eager' : loading} // First 6 images load eagerly
            className="w-full h-full rounded-lg"
            quality="high"
          />
        </div>
      ))}
    </div>
  );
}; 