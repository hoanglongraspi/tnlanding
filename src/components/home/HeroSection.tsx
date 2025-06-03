import { Camera, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WebPOnlyImage } from "@/components/ui/webp-only-image";
import { useWebPBatchOptimizer } from "@/hooks/useWebPOptimizer";

interface HeroSectionProps {
  language: string;
  toggleLanguage: () => void;
  content: any;
}

export const HeroSection = ({ language, toggleLanguage, content }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Background images for slideshow - auto-convert to WebP
  const backgroundImages = [
    '/ẢNH BÌA CTY.png',    // Will auto-convert to .webp
    '/DSC01742.jpg',      // Will auto-convert to .webp
    '/DSCF3135.jpg'       // Will auto-convert to .webp
  ];

  // Auto-optimize all background images to WebP
  const { optimizedUrls: optimizedBackgrounds, isLoading: imagesLoading } = useWebPBatchOptimizer(backgroundImages);

  // Auto-play slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const t = content[language];

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-lg z-50 border-b border-gray-800/30 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <WebPOnlyImage 
                src="/logo_transparent.png" 
                alt="TN Films Logo" 
                className="h-20 w-auto hover:scale-105 transition-all duration-300 cursor-pointer filter drop-shadow-lg hover:drop-shadow-2xl"
                priority
                quality="high"
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t.nav.home}
              </a>
              <button 
                onClick={() => navigate('/about')}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {t.nav.about}
              </button>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t.nav.contact}
              </a>
              
              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1 bg-gray-800/50 hover:bg-gray-700/60 backdrop-blur-sm rounded-lg px-3 py-2 transition-colors duration-300"
                >
                  <span className={`text-sm font-medium ${language === 'vi' ? 'text-white' : 'text-gray-400'}`}>
                    VI
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className={`text-sm font-medium ${language === 'en' ? 'text-white' : 'text-gray-400'}`}>
                    EN
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-36">
        {/* WebP-Only Slideshow Background */}
        <div className="absolute inset-0">
          {!imagesLoading && optimizedBackgrounds.map((webpImage, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <WebPOnlyImage 
                src={webpImage} 
                alt={`TN Films Background ${index + 1}`}
                className="w-full h-full object-cover"
                priority={index === 0}
                quality="high"
                placeholder="blur"
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          ))}

          {/* Loading state for slideshow */}
          {imagesLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <div className="text-white text-lg font-medium">Loading WebP Images...</div>
                <div className="text-gray-400 text-sm">79.8% lighter, loading faster ⚡</div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle additional effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-32 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Slideshow indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-gray-300">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-medium">{t.hero.badge}</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
                {t.hero.title}
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed max-w-lg drop-shadow-md">
                {t.hero.description}
              </p>
            </div>
            <div className="space-y-8 mt-8">
              {/* Primary CTA */}
              <div className="relative">
                <Button 
                  onClick={() => {
                    const portfolioSection = document.querySelector('#portfolio');
                    if (portfolioSection) {
                      portfolioSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-white via-gray-50 to-white hover:from-gray-50 hover:via-white hover:to-gray-50 text-gray-900 px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-500 hover:scale-105 transform group border border-white/20"
                >
                  <span className="relative z-10">{t.hero.viewPortfolio}</span>
                  <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                <Button 
                  onClick={() => navigate('/about')}
                  variant="ghost" 
                  className="group relative overflow-hidden bg-white/10 hover:bg-white/15 backdrop-blur-md text-white border border-white/20 hover:border-white/30 px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
                >
                  <span className="relative z-10 flex items-center">
                    {t.hero.aboutUs}
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>

                <Button 
                  onClick={() => {
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  variant="ghost" 
                  className="group relative overflow-hidden bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-md text-white border border-blue-400/30 hover:border-blue-400/50 px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <span className="relative z-10 flex items-center">
                    {t.hero.contact}
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
              </div>
              
              {/* WebP Performance Indicator */}
              {process.env.NODE_ENV === 'development' && !imagesLoading && (
                <div className="inline-flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-2 text-green-300 border border-green-500/30">
                  <span className="text-sm">📦 WebP Active: 79.8% lighter images</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}; 