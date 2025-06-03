import { Camera, Film, Video, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useFeaturedCommercialThumbnailSWR } from "@/hooks/useSWROptimized";
import { getThumbnailUrl } from "@/lib/utils";

interface PortfolioSectionProps {
  language: string;
  content: any;
}

export const PortfolioSection = ({ language, content }: PortfolioSectionProps) => {
  const navigate = useNavigate();
  const t = content[language];

  // Fetch featured commercial thumbnail with SWR for better caching
  const { 
    data: featuredCommercial, 
    isLoading: commercialLoading, 
    error: commercialError,
    hasData
  } = useFeaturedCommercialThumbnailSWR();

  // Helper function to get the thumbnail URL with fallback
  const getCommercialThumbnail = () => {
    if (commercialError || !hasData) {
      return "/PTSCHaiPhong7.webp"; // Fallback to WebP default image
    }
    
    return getThumbnailUrl(featuredCommercial.media_url, featuredCommercial.thumbnail_url);
  };

  // Helper function to get the alt text
  const getCommercialAltText = () => {
    if (commercialError || !hasData) {
      return "PTSC Hai Phong Industrial Operations";
    }
    return featuredCommercial.title || "Commercial Work";
  };

  return (
    <section id="portfolio" className="py-24 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            {t.portfolio.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t.portfolio.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Personal Project Card */}
          <Card className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 hover:border-blue-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 backdrop-blur-lg">
            <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden">
              <OptimizedImage 
                src="/DSC01742.webp" 
                alt="Personal Project Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
              
              {/* Icon */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/30 group-hover:bg-blue-500/30 transition-colors duration-300">
                <Camera className="w-6 h-6 text-blue-400" />
              </div>
              
              {/* Hover Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button 
                  onClick={() => navigate('/personal-project')}
                  className="bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm"
                >
                  <span className="mr-2">{t.portfolio.personal.button}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                {t.portfolio.personal.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t.portfolio.personal.description}
              </p>
            </CardContent>
          </Card>

          {/* Commercial Work Card */}
          <Card className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 hover:border-orange-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 backdrop-blur-lg">
            <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden">
              {commercialLoading ? (
                <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                </div>
              ) : (
                <OptimizedImage 
                  src={getCommercialThumbnail()} 
                  alt={getCommercialAltText()}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  fallbackSrc="/PTSCHaiPhong7.webp"
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
              
              {/* Icon */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-orange-400/30 group-hover:bg-orange-500/30 transition-colors duration-300">
                <Film className="w-6 h-6 text-orange-400" />
              </div>
              
              {/* Hover Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button 
                  onClick={() => navigate('/commercial-work')}
                  className="bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm"
                >
                  <span className="mr-2">{t.portfolio.commercial.button}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-300">
                {t.portfolio.commercial.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t.portfolio.commercial.description}
              </p>
            </CardContent>
          </Card>

          {/* Events Card */}
          <Card className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 hover:border-green-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 backdrop-blur-lg">
            <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden">
              <OptimizedImage 
                src="/DSCF3135.webp" 
                alt="Events Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
              
              {/* Icon */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/30 group-hover:bg-green-500/30 transition-colors duration-300">
                <Video className="w-6 h-6 text-green-400" />
              </div>
              
              {/* Hover Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button 
                  onClick={() => navigate('/events')}
                  className="bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm"
                >
                  <span className="mr-2">{t.portfolio.events.button}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                {t.portfolio.events.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t.portfolio.events.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}; 