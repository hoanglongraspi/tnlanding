import useSWR, { mutate } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { portfolioService, companyGalleryService, companyService, checkCompanyTablesSetup } from '@/lib/database-service';
import { Portfolio, CompanyGallery, Company } from '@/lib/supabase';

// SWR configuration for optimal caching
const swrConfig = {
  // Cache for 10 minutes before considering stale
  dedupingInterval: 10 * 60 * 1000,
  // Revalidate every 15 minutes in background
  refreshInterval: 15 * 60 * 1000,
  // Only revalidate on focus if data is older than 5 minutes
  revalidateOnFocus: false,
  // Don't revalidate on reconnect to avoid unnecessary requests
  revalidateOnReconnect: false,
  // Retry up to 3 times on error
  errorRetryCount: 3,
  // Use exponential backoff for retries
  errorRetryInterval: 1000,
  // Keep previous data while revalidating for better UX
  keepPreviousData: true,
  // Enable SWR's built-in cache
  suspense: false,
};

// Portfolio hooks with SWR
export const usePortfolioSWR = (
  category?: 'personal' | 'commercial' | 'events',
  status: 'published' | 'draft' = 'published'
) => {
  const key = category ? `portfolio-${category}-${status}` : `portfolio-all-${status}`;
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    key,
    () => portfolioService.getAll(category, status),
    {
      ...swrConfig,
      // Cache portfolio data longer since it changes less frequently
      dedupingInterval: 15 * 60 * 1000, // 15 minutes
      refreshInterval: 30 * 60 * 1000,   // 30 minutes
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    revalidate,
    // Helper methods
    refresh: () => revalidate(),
    isEmpty: !data || data.length === 0,
  };
};

export const useFeaturedPortfolioSWR = () => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    'portfolio-featured',
    () => portfolioService.getFeatured(),
    {
      ...swrConfig,
      // Featured items cache even longer
      dedupingInterval: 20 * 60 * 1000, // 20 minutes
      refreshInterval: 60 * 60 * 1000,   // 1 hour
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    revalidate,
    isEmpty: !data || data.length === 0,
  };
};

// Company-related hooks
export const useCompaniesTablesCheckSWR = () => {
  const { data, error, isLoading } = useSWR(
    'company-tables-check',
    () => checkCompanyTablesSetup(),
    {
      ...swrConfig,
      // Table structure checks cache for very long time
      dedupingInterval: 60 * 60 * 1000,   // 1 hour
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
      revalidateOnMount: false, // Only check once per session
    }
  );

  return {
    data,
    error,
    isLoading,
    exists: data?.exists !== false,
  };
};

export const useCompaniesSWR = (status: 'published' | 'draft' | 'all' = 'published') => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    `companies-${status}`,
    () => companyService.getAll(status === 'all' ? undefined : status),
    {
      ...swrConfig,
      dedupingInterval: 15 * 60 * 1000, // 15 minutes
      refreshInterval: 30 * 60 * 1000,   // 30 minutes
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    revalidate,
    isEmpty: !data || data.length === 0,
  };
};

export const useFeaturedCommercialThumbnailSWR = (enabled = true) => {
  const { exists } = useCompaniesTablesCheckSWR();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    enabled && exists ? 'featured-commercial-thumbnail' : null,
    () => companyGalleryService.getFeaturedCommercialThumbnail(),
    {
      ...swrConfig,
      // Featured commercial thumbnail caches longer
      dedupingInterval: 25 * 60 * 1000, // 25 minutes
      refreshInterval: 60 * 60 * 1000,   // 1 hour
    }
  );

  return {
    data,
    error,
    isLoading,
    revalidate,
    hasData: !!data,
  };
};

// Company Gallery with infinite loading
export const useCompanyGalleryInfiniteSWR = (
  companyId?: string,
  pageSize = 12
) => {
  const getKey = (pageIndex: number, previousPageData: CompanyGallery[] | null) => {
    // If no company ID, don't fetch
    if (!companyId) return null;
    
    // If reached the end, don't fetch
    if (previousPageData && previousPageData.length < pageSize) return null;
    
    // SWR key
    return `company-gallery-${companyId}-page-${pageIndex}`;
  };

  const { data, error, isLoading, size, setSize, mutate: revalidate } = useSWRInfinite(
    getKey,
    (key) => {
      const pageIndex = parseInt(key.split('-page-')[1]);
      return companyGalleryService.getPaginated(companyId, pageIndex, pageSize);
    },
    {
      ...swrConfig,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes
      refreshInterval: 20 * 60 * 1000,   // 20 minutes
    }
  );

  const items = data ? data.flat() : [];
  const hasMore = data ? data[data.length - 1]?.length === pageSize : false;
  
  return {
    data: items,
    error,
    isLoading,
    hasMore,
    loadMore: () => setSize(size + 1),
    revalidate,
    isEmpty: items.length === 0,
    totalPages: size,
  };
};

// Utility functions for cache management
export const swrCacheUtils = {
  // Clear all portfolio cache
  clearPortfolioCache: () => {
    mutate(key => typeof key === 'string' && key.startsWith('portfolio'), undefined, { revalidate: false });
  },
  
  // Clear specific portfolio category cache
  clearPortfolioCategoryCache: (category: string) => {
    mutate(`portfolio-${category}-published`, undefined, { revalidate: false });
    mutate(`portfolio-${category}-draft`, undefined, { revalidate: false });
  },
  
  // Clear company related cache
  clearCompanyCache: () => {
    mutate(key => typeof key === 'string' && (
      key.startsWith('companies') || 
      key.startsWith('company-gallery') ||
      key.startsWith('featured-commercial')
    ), undefined, { revalidate: false });
  },
  
  // Refresh all data
  refreshAll: () => {
    mutate(() => true, undefined, { revalidate: true });
  },
  
  // Optimistic updates for mutations
  updatePortfolioItem: (category: string, item: Portfolio) => {
    const key = `portfolio-${category}-published`;
    mutate(key, (current: Portfolio[] | undefined) => {
      if (!current) return current;
      return current.map(p => p.id === item.id ? item : p);
    }, { revalidate: false });
  },
  
  addPortfolioItem: (category: string, item: Portfolio) => {
    const key = `portfolio-${category}-published`;
    mutate(key, (current: Portfolio[] | undefined) => {
      if (!current) return [item];
      return [item, ...current];
    }, { revalidate: false });
  },
  
  removePortfolioItem: (category: string, itemId: string) => {
    const key = `portfolio-${category}-published`;
    mutate(key, (current: Portfolio[] | undefined) => {
      if (!current) return current;
      return current.filter(p => p.id !== itemId);
    }, { revalidate: false });
  },
};

// Hook for preloading data
export const useSWRPreloader = () => {
  const preloadPortfolio = (category?: string) => {
    const key = category ? `portfolio-${category}-published` : 'portfolio-all-published';
    mutate(key, portfolioService.getAll(category as any, 'published'), { revalidate: false });
  };

  const preloadFeaturedCommercial = () => {
    mutate('featured-commercial-thumbnail', companyGalleryService.getFeaturedCommercialThumbnail(), { revalidate: false });
  };

  const preloadCompanies = () => {
    mutate('companies-published', companyService.getAll('published'), { revalidate: false });
  };

  return {
    preloadPortfolio,
    preloadFeaturedCommercial, 
    preloadCompanies,
  };
}; 