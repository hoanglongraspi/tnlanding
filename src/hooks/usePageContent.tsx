import { useQuery } from "@tanstack/react-query";
import { pageService } from "@/lib/database-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export const usePageContent = (pageName: string = "home") => {
  return useQuery({
    queryKey: ['page-content', pageName],
    queryFn: () => pageService.getPageContent(pageName),
    enabled: isSupabaseConfigured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper function to get specific content section
export const useContentSection = (pageName: string, sectionId: string) => {
  const { data: allContent, ...query } = usePageContent(pageName);
  
  const content = allContent?.find(item => item.section === sectionId);
  
  return {
    ...query,
    content: content?.content || '',
    title: content?.title || '',
    type: content?.type || 'text'
  };
};

// Helper function to get content with fallback
export const getContentWithFallback = (
  allContent: any[], 
  sectionId: string, 
  fallback: string = ''
): string => {
  const content = allContent?.find(item => item.section === sectionId);
  return content?.content || fallback;
}; 