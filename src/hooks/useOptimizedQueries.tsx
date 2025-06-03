import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  portfolioService, 
  companyGalleryService, 
  checkCompanyTablesSetup,
  contentService 
} from '@/lib/database-service';
import { Portfolio, CompanyGallery, Company } from '@/lib/supabase';

// Optimized portfolio queries
export const usePortfolioItems = (
  category?: 'personal' | 'commercial' | 'events', 
  status: 'published' | 'draft' = 'published'
) => {
  return useQuery({
    queryKey: ['portfolio', category, status],
    queryFn: () => portfolioService.getAll(category, status),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data || [], // Ensure always returns array
  });
};

// Optimized featured portfolio query
export const useFeaturedPortfolio = () => {
  return useQuery({
    queryKey: ['portfolio', 'featured'],
    queryFn: () => portfolioService.getFeatured(),
    staleTime: 15 * 60 * 1000, // 15 minutes - featured items change less frequently
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
    select: (data) => data || [],
  });
};

// Optimized company tables check
export const useCompanyTablesCheck = () => {
  return useQuery({
    queryKey: ['company-tables-check'],
    queryFn: () => checkCompanyTablesSetup(),
    staleTime: 30 * 60 * 1000, // 30 minutes - table structure doesn't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Only check once per session
  });
};

// Optimized featured commercial thumbnail
export const useFeaturedCommercialThumbnail = (enabled = true) => {
  const { data: tableCheck } = useCompanyTablesCheck();
  
  return useQuery({
    queryKey: ['featured-commercial-thumbnail'],
    queryFn: () => companyGalleryService.getFeaturedCommercialThumbnail(),
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    retryOnMount: false,
    enabled: enabled && tableCheck?.exists !== false,
    refetchOnWindowFocus: false,
  });
};

// Optimized company gallery with pagination
export const useCompanyGalleryPaginated = (
  companyId?: string,
  pageSize = 10
) => {
  return useInfiniteQuery({
    queryKey: ['company-gallery', companyId, 'paginated'],
    queryFn: ({ pageParam = 0 }) => 
      companyGalleryService.getPaginated(companyId, pageParam, pageSize),
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === pageSize ? pages.length : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!companyId,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      items: data.pages.flat(),
    }),
  });
};

// Optimized content management
export const usePageContent = (pageName: string) => {
  return useQuery({
    queryKey: ['page-content', pageName],
    queryFn: () => contentService.getPageContent(pageName),
    staleTime: 15 * 60 * 1000, // 15 minutes - content changes less frequently
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
    select: (data) => data || [],
  });
};

// Optimized dashboard analytics
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => contentService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data should be relatively fresh
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes when active
  });
};

// Optimized mutation hooks
export const usePortfolioMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>) =>
      portfolioService.create(data),
    onSuccess: () => {
      // Invalidate all portfolio queries
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      // Optionally invalidate dashboard analytics
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Portfolio> }) =>
      portfolioService.update(id, updates),
    onSuccess: (updatedItem) => {
      // Update specific item in cache
      queryClient.setQueryData(['portfolio', 'item', updatedItem.id], updatedItem);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['portfolio'], exact: false });
    },
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => portfolioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    retry: 1,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

// Optimized company gallery mutations
export const useCompanyGalleryMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<CompanyGallery, 'id' | 'created_at' | 'updated_at'>) =>
      companyGalleryService.create(data),
    onSuccess: (newItem) => {
      // Invalidate company gallery queries
      queryClient.invalidateQueries({ queryKey: ['company-gallery'] });
      // Invalidate featured commercial if this is featured
      if (newItem.featured) {
        queryClient.invalidateQueries({ queryKey: ['featured-commercial-thumbnail'] });
      }
    },
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CompanyGallery> }) =>
      companyGalleryService.update(id, updates),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['company-gallery'] });
      // Invalidate featured commercial if featured status changed
      if ('featured' in updatedItem) {
        queryClient.invalidateQueries({ queryKey: ['featured-commercial-thumbnail'] });
      }
    },
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyGalleryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['featured-commercial-thumbnail'] });
    },
    retry: 1,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

// Query prefetching utilities
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();

  const prefetchPortfolio = (category?: string) => {
    queryClient.prefetchQuery({
      queryKey: ['portfolio', category, 'published'],
      queryFn: () => portfolioService.getAll(category as any, 'published'),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchFeaturedCommercial = () => {
    queryClient.prefetchQuery({
      queryKey: ['featured-commercial-thumbnail'],
      queryFn: () => companyGalleryService.getFeaturedCommercialThumbnail(),
      staleTime: 20 * 60 * 1000,
    });
  };

  return {
    prefetchPortfolio,
    prefetchFeaturedCommercial,
  };
}; 