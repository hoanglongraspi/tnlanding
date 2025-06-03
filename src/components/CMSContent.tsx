import { usePageContent, getContentWithFallback } from "@/hooks/usePageContent";

interface CMSContentProps {
  section: string;
  fallback?: string;
  className?: string;
  children?: React.ReactNode;
}

// Simple component to display CMS content with fallback
export const CMSContent = ({ section, fallback = "", className = "", children }: CMSContentProps) => {
  const { data: content, isLoading, error } = usePageContent("home");

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-700/50 rounded ${className}`}>{children}</div>;
  }

  if (error || !content) {
    return fallback ? <span className={className}>{fallback}</span> : children;
  }

  const sectionContent = getContentWithFallback(content, section, fallback);

  return (
    <span className={className}>
      {sectionContent || children}
    </span>
  );
};

// Component to display CMS title and content together
export const CMSSection = ({ section, fallbackTitle = "", fallbackContent = "", titleClassName = "", contentClassName = "" }: {
  section: string;
  fallbackTitle?: string;
  fallbackContent?: string;
  titleClassName?: string;
  contentClassName?: string;
}) => {
  const { data: content, isLoading } = usePageContent("home");

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className={`animate-pulse bg-gray-700/50 rounded h-8 w-3/4 ${titleClassName}`}></div>
        <div className={`animate-pulse bg-gray-700/50 rounded h-20 ${contentClassName}`}></div>
      </div>
    );
  }

  const sectionData = content?.find(item => item.section === section);
  const title = sectionData?.title || fallbackTitle;
  const text = sectionData?.content || fallbackContent;

  return (
    <div>
      {title && <h2 className={titleClassName}>{title}</h2>}
      {text && <p className={contentClassName}>{text}</p>}
    </div>
  );
};

export default CMSContent; 