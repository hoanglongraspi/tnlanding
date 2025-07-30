// Performance utility functions for TN Films

/**
 * Debounce utility for optimizing frequent function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle utility for limiting function execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Image preloader with priority queue
 */
export class ImagePreloader {
  private queue: Array<{ url: string; priority: number }> = [];
  private loading = new Set<string>();
  private loaded = new Set<string>();
  private maxConcurrent = 3;
  private currentLoading = 0;

  preload(url: string, priority: number = 1): Promise<void> {
    if (this.loaded.has(url) || this.loading.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ url, priority });
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.currentLoading >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.currentLoading++;
    this.loading.add(item.url);

    try {
      await this.loadImage(item.url);
      this.loaded.add(item.url);
    } catch (error) {
      console.warn(`Failed to preload image: ${item.url}`);
    } finally {
      this.loading.delete(item.url);
      this.currentLoading--;
      this.processQueue();
    }
  }

  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  getStats() {
    return {
      queued: this.queue.length,
      loading: this.loading.size,
      loaded: this.loaded.size,
    };
  }
}

/**
 * Memory usage monitor
 */
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
    };
  }
  return null;
};

/**
 * Network request optimizer
 */
export class RequestOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();

  async fetch<T>(
    url: string,
    options: RequestInit = {},
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const key = this.getCacheKey(url, options);
    
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make new request
    const promise = this.makeRequest<T>(url, options, ttl, key);
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    ttl: number,
    key: string
  ): Promise<T> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache successful response
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    return data;
  }

  private getCacheKey(url: string, options: RequestInit): string {
    return `${url}_${JSON.stringify(options)}`;
  }

  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      pending: this.pendingRequests.size,
    };
  }
}

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private marks = new Map<string, number>();
  private measures = new Map<string, number>();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (start === undefined) {
      console.warn(`Start mark "${startMark}" not found`);
      return;
    }

    const duration = (end || performance.now()) - start;
    this.measures.set(name, duration);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name);
  }

  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

/**
 * Resource cleanup utilities
 */
export const cleanup = {
  // Clean up event listeners
  removeEventListeners(element: Element | Window, events: Record<string, EventListener>) {
    Object.entries(events).forEach(([event, listener]) => {
      element.removeEventListener(event, listener);
    });
  },

  // Clean up timers
  clearTimers(...timers: (NodeJS.Timeout | number)[]) {
    timers.forEach(timer => {
      if (typeof timer === 'number') {
        clearTimeout(timer);
        clearInterval(timer);
      } else {
        clearTimeout(timer);
        clearInterval(timer);
      }
    });
  },

  // Clean up observers
  disconnectObservers(...observers: (IntersectionObserver | MutationObserver | ResizeObserver)[]) {
    observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
  },
};

/**
 * Bundle size analyzer
 */
export const analyzeBundleSize = () => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const analysis = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    fontSize: 0,
    resources: [] as Array<{
      name: string;
      size: number;
      type: string;
      loadTime: number;
    }>,
  };

  resources.forEach(resource => {
    const size = resource.transferSize || 0;
    const loadTime = resource.responseEnd - resource.startTime;
    const url = resource.name;
    
    let type = 'other';
    if (url.includes('.js')) type = 'js';
    else if (url.includes('.css')) type = 'css';
    else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) type = 'image';
    else if (url.match(/\.(woff|woff2|ttf|otf)$/)) type = 'font';

    analysis.totalSize += size;
    
    switch (type) {
      case 'js': analysis.jsSize += size; break;
      case 'css': analysis.cssSize += size; break;
      case 'image': analysis.imageSize += size; break;
      case 'font': analysis.fontSize += size; break;
    }

    analysis.resources.push({
      name: url.split('/').pop() || url,
      size,
      type,
      loadTime,
    });
  });

  // Sort by size descending
  analysis.resources.sort((a, b) => b.size - a.size);

  return analysis;
};

// Singleton instances
export const imagePreloader = new ImagePreloader();
export const requestOptimizer = new RequestOptimizer();
export const performanceMetrics = new PerformanceMetrics(); 