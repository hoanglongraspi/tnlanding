import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  memoryUsage: number;
  queryCount: number;
  cacheSize: number;
  renderTime: number;
}

interface PerformanceConfig {
  enableMemoryCleanup?: boolean;
  maxCacheSize?: number;
  queryDeduplication?: boolean;
  prefetchOnHover?: boolean;
  debounceMs?: number;
}

export const usePerformanceOptimizer = (config: PerformanceConfig = {}) => {
  const queryClient = useQueryClient();
  
  const {
    enableMemoryCleanup = true,
    maxCacheSize = 50,
    queryDeduplication = true,
    prefetchOnHover = true,
    debounceMs = 300
  } = config;

  // Memory cleanup interval
  useEffect(() => {
    if (!enableMemoryCleanup) return;

    const cleanup = () => {
      // Clear unused query cache
      queryClient.clear();
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      // Clear image cache periodically
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
          img.src = img.src; // Force reload broken images
        }
      });
    };

    const interval = setInterval(cleanup, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [enableMemoryCleanup, queryClient]);

  // Query optimization
  const optimizeQueries = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove stale queries
    queries.forEach(query => {
      if (query.getObserversCount() === 0 && 
          Date.now() - query.state.dataUpdatedAt > 10 * 60 * 1000) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    // Limit cache size
    if (queries.length > maxCacheSize) {
      const sortedQueries = queries.sort((a, b) => 
        a.state.dataUpdatedAt - b.state.dataUpdatedAt
      );
      
      const toRemove = sortedQueries.slice(0, queries.length - maxCacheSize);
      toRemove.forEach(query => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
    }
  }, [queryClient, maxCacheSize]);

  // Debounced search optimization
  const createDebouncedCallback = useCallback((callback: Function) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback(...args), debounceMs);
    };
  }, [debounceMs]);

  // Prefetch on hover
  const createHoverPrefetch = useCallback((queryKey: any[], queryFn: () => Promise<any>) => {
    if (!prefetchOnHover) return () => {};
    
    return () => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    };
  }, [queryClient, prefetchOnHover]);

  // Performance metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      memoryUsage: performance.memory?.usedJSHeapSize || 0,
      queryCount: queries.length,
      cacheSize: JSON.stringify(queries).length,
      renderTime: performance.now(),
    };
  }, [queryClient]);

  // Image preloading optimization
  const preloadImages = useCallback((urls: string[]) => {
    const preloadImage = (url: string) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    };

    // Limit concurrent preloads
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    return batches.reduce(async (prevPromise, batch) => {
      await prevPromise;
      return Promise.allSettled(batch.map(preloadImage));
    }, Promise.resolve());
  }, []);

  // Optimize component re-renders
  const memoizeCallback = useCallback((fn: Function, deps: any[]) => {
    return useCallback(fn, deps);
  }, []);

  const memoizeValue = useCallback((fn: Function, deps: any[]) => {
    return useMemo(fn, deps);
  }, []);

  // Virtual scrolling helper
  const createVirtualList = useCallback((
    items: any[], 
    itemHeight: number, 
    containerHeight: number
  ) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferCount = Math.min(5, Math.floor(visibleCount / 2));
    
    return {
      visibleCount: visibleCount + bufferCount * 2,
      getVisibleRange: (scrollTop: number) => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferCount);
        const end = Math.min(items.length, start + visibleCount + bufferCount * 2);
        return { start, end };
      }
    };
  }, []);

  // Network optimization
  const optimizeRequests = useCallback(() => {
    // Cancel duplicate requests
    if (queryDeduplication) {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      const duplicates = new Map();
      queries.forEach(query => {
        const key = JSON.stringify(query.queryKey);
        if (duplicates.has(key)) {
          query.cancel();
        } else {
          duplicates.set(key, query);
        }
      });
    }
  }, [queryClient, queryDeduplication]);

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      optimizeQueries();
      optimizeRequests();
    };
  }, [optimizeQueries, optimizeRequests]);

  return {
    optimizeQueries,
    createDebouncedCallback,
    createHoverPrefetch,
    getMetrics,
    preloadImages,
    memoizeCallback,
    memoizeValue,
    createVirtualList,
    optimizeRequests,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const startTime = useMemo(() => performance.now(), []);
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('🎯 LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('⚡ FID:', entry.processingStart - entry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    
    return () => observer.disconnect();
  }, []);

  return {
    getRenderTime: () => performance.now() - startTime,
    getMemoryUsage: () => (performance as any).memory?.usedJSHeapSize || 0,
  };
}; 