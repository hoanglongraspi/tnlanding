import { Camera, Film, Video, Image, ChevronRight, Mail, Phone, Play, X, ArrowLeft, Globe, Maximize, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePageContent, getContentWithFallback } from "@/hooks/usePageContent";
import { useQuery } from "@tanstack/react-query";
import { companyGalleryService, checkCompanyTablesSetup } from "@/lib/database-service";
import { getThumbnailUrl } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('vi');
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInView, setVideoInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Fetch CMS content
  const { data: cmsContent } = usePageContent("home");

  // Check if company tables exist (run once on mount)
  const { data: tableCheck } = useQuery({
    queryKey: ['company-tables-check'],
    queryFn: () => checkCompanyTablesSetup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch featured commercial thumbnail (only if tables exist)
  const { data: featuredCommercial, isLoading: commercialLoading, error: commercialError } = useQuery({
    queryKey: ['featured-commercial-thumbnail'],
    queryFn: () => companyGalleryService.getFeaturedCommercialThumbnail(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
    retryOnMount: false, // Don't retry on component mount
    enabled: tableCheck?.exists !== false, // Only run if tables exist
  });

  // Log helpful information about setup
  useEffect(() => {
    if (tableCheck && !tableCheck.exists) {
      console.warn(`🔧 ${tableCheck.message}`);
      console.info('💡 To enable dynamic commercial thumbnails, please set up the company tables in your Supabase database.');
      console.info('📄 Run the SQL script from: src/lib/quick-companies-setup.sql');
    } else if (tableCheck?.exists && commercialError) {
      console.warn('⚠️ Company tables exist but no commercial thumbnails found. Add some gallery items in the admin panel.');
    }
  }, [tableCheck, commercialError]);

  // Background images for slideshow - now using WebP for better performance
  const backgroundImages = [
    '/ẢNH BÌA CTY.webp',
    '/DSC01742.webp', 
    '/DSCF3135.webp'
  ];

  // Auto-play slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for video lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVideoInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const videoContainer = document.querySelector('#video-container');
    if (videoContainer) {
      observer.observe(videoContainer);
    }

    return () => observer.disconnect();
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  // Helper function to get CMS content with fallback
  const getCMSContent = (section: string, fallback: string) => {
    return getContentWithFallback(cmsContent || [], section, fallback);
  };

  // Helper function to get the thumbnail URL with fallback
  const getCommercialThumbnail = () => {
    if (commercialError || !featuredCommercial) {
      console.log('Using fallback image - commercialError:', commercialError, 'featuredCommercial:', featuredCommercial);
      return "/PTSCHaiPhong7.webp"; // Fallback to WebP default image
    }
    
    const thumbnailUrl = getThumbnailUrl(featuredCommercial.media_url, featuredCommercial.thumbnail_url);
    console.log('Commercial thumbnail data:', {
      title: featuredCommercial.title,
      originalThumbnailUrl: featuredCommercial.thumbnail_url,
      convertedThumbnailUrl: thumbnailUrl,
      mediaUrl: featuredCommercial.media_url
    });
    
    return thumbnailUrl;
  };

  // State to track if we need to use fallback image
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  // Helper function to get the alt text
  const getCommercialAltText = () => {
    if (commercialError || !featuredCommercial) {
      return "PTSC Hai Phong Industrial Operations";
    }
    // Since we're not fetching company data anymore, just use the title
    return featuredCommercial.title || "Commercial Work";
  };

  // Language content object with CMS integration
  const content = {
    vi: {
      nav: {
        home: 'Trang chủ',
        about: 'Về chúng tôi', 
        contact: 'Liên hệ'
      },
      hero: {
        badge: 'Tunguyenfilm Co. Ltd',
        title: getCMSContent('hero-title', 'Tú Nguyễn Film'),
        description: getCMSContent('hero-subtitle', 'Kiến tạo giá trị hình ảnh cho doanh nghiệp qua video và nhiếp ảnh chuyên nghiệp, sáng tạo, giàu cảm xúc.'),
        viewPortfolio: 'Xem Portfolio',
        aboutUs: 'Về chúng tôi',
        contact: 'Liên hệ',
        demoReel: 'Demo Reel'
      },
      portfolio: {
        title: getCMSContent('portfolio-title', 'Portfolio'),
        subtitle: getCMSContent('portfolio-subtitle', 'Khám phá những dự án đã thực hiện với chất lượng và sự sáng tạo'),
        personal: {
          title: 'Personal Project',
          description: 'Những dự án cá nhân, nghệ thuật và sáng tạo',
          button: 'Xem thêm'
        },
        commercial: {
          title: 'Commercial Work', 
          description: 'Quảng cáo, corporate video và brand content',
          button: 'Xem thêm'
        },
        events: {
          title: 'Events',
          description: 'Cưới hỏi, sự kiện và những khoảnh khắc đặc biệt',
          button: 'Xem thêm'
        }
      },
      contact: {
        title: getCMSContent('contact-title', 'Liên hệ hợp tác'),
        subtitle: getCMSContent('contact-subtitle', 'Sẵn sàng biến ý tưởng của bạn thành hiện thực')
      },
      footer: {
        title: 'TN Films',
        // description: 'Chuyên gia trong lĩnh vực quay phim và chụp ảnh với hơn 5 năm kinh nghiệm. Chúng tôi mang đến những khoảnh khắc đẹp nhất cho bạn.',
        servicesTitle: 'Liên hệ',
        services: [
          'Email: tunguyenfilm@gmail.com',
          'TuNguyen Film fanpage: https://www.facebook.com/share/1DiibpAwPB/?mibextid=wwXIfr',
          '0387990332'
        ],
        copyright: '© 2024 Tú Nguyễn Film. All rights reserved.'
      }
    },
    en: {
      nav: {
        home: 'Home',
        about: 'About Us',
        contact: 'Contact'
      },
      hero: {
        badge: 'Photographer / Videographer',
        title: getCMSContent('hero-title', 'Tu Nguyen Film'),
        description: getCMSContent('hero-subtitle', 'Specializing in professional, emotional and creative videography and photography for events, weddings and advertising.'),
        viewPortfolio: 'View Portfolio',
        aboutUs: 'About Us',
        contact: 'Contact',
        demoReel: 'Demo Reel'
      },
      portfolio: {
        title: getCMSContent('portfolio-title', 'Portfolio'),
        subtitle: getCMSContent('portfolio-subtitle', 'Explore projects completed with quality and creativity'),
        personal: {
          title: 'Personal Project',
          description: 'Personal, artistic and creative projects',
          button: 'View More'
        },
        commercial: {
          title: 'Commercial Work',
          description: 'Advertising, corporate video and brand content',
          button: 'View More'
        },
        events: {
          title: 'Events', 
          description: 'Weddings, events and special moments',
          button: 'View More'
        }
      },
      contact: {
        title: getCMSContent('contact-title', 'Contact & Collaboration'),
        subtitle: getCMSContent('contact-subtitle', 'Ready to turn your ideas into reality')
      },
      footer: {
        title: 'TN Films',
        description: 'Expert in videography and photography with over 5 years of experience. We bring you the most beautiful moments.',
        servicesTitle: 'Contact',
        services: [
          'Email: tunguyenfilm@gmail.com',
          'TuNguyen Film fanpage: https://www.facebook.com/share/1DiibpAwPB/?mibextid=wwXIfr',
          '0387990332'
        ],
        copyright: '© 2024 Tu Nguyen Film. All rights reserved.'
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-lg z-50 border-b border-gray-800/30 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/logo_transparent.png" 
                alt="TN Films Logo" 
                className="h-20 w-auto hover:scale-105 transition-all duration-300 cursor-pointer filter drop-shadow-lg hover:drop-shadow-2xl"
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
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image} 
                alt={`Background ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          ))}
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
                    <Mail className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-1 shadow-2xl">
              <div 
                id="video-container"
                className="aspect-video bg-gradient-to-br from-gray-700/80 to-gray-900/80 backdrop-blur-sm rounded-[22px] flex items-center justify-center relative overflow-hidden border border-white/10"
              >
                {/* Loading State */}
                {!videoInView && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                    <div className="text-center space-y-4 relative z-10">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 animate-pulse">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                      <p className="text-white/90 font-medium">{t.hero.demoReel}</p>
                      <p className="text-white/70 text-sm">Loading video...</p>
                    </div>
                  </div>
                )}

                {/* Video - Only load when in view */}
                {videoInView && (
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    poster="/project-thumbnail.png"
                    preload="none"
                    className={`absolute inset-0 w-full h-full object-cover rounded-[22px] transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoadedData={handleVideoLoad}
                    onError={(e) => {
                      // Hide video and show placeholder if video fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                    ref={videoRef}
                  >
                    <source src="/TVCTuNguyenFilm.mp4" type="video/mp4" />
                    <source src="/TVCTuNguyenFilm.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                )}
                
                {/* Fullscreen button overlay - only show when video is loaded */}
                {videoLoaded && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-[22px]"
                    onClick={handleFullscreen}
                  >
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Maximize className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section (CMS Content Demo) */}
      {/* <section className="py-20 px-6 bg-gray-800 relative">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {getCMSContent('about-title', language === 'vi' ? 'Về Chúng Tôi' : 'About Us')}
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              {getCMSContent('about-text', language === 'vi' 
                ? 'Chúng tôi là đội ngũ chuyên nghiệp trong lĩnh vực quay phim và chụp ảnh, luôn nỗ lực mang đến những khoảnh khắc đẹp nhất cho bạn.'
                : 'We are a professional team in videography and photography, always striving to bring you the most beautiful moments.'
              )}
            </p>
            {getCMSContent('services-title', '') && (
              <div className="pt-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {getCMSContent('services-title', language === 'vi' ? 'Dịch Vụ' : 'Services')}
                </h3>
                <p className="text-gray-300">
                  {getCMSContent('services-text', language === 'vi'
                    ? 'Chúng tôi cung cấp dịch vụ quay phim, chụp ảnh chuyên nghiệp cho mọi loại sự kiện.'
                    : 'We provide professional videography and photography services for all types of events.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </section> */}

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 px-6 bg-gray-900 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/ẢNH BÌA CTY.webp"
            alt="TN Films Company Background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900/90"></div>
        </div>

        {/* Enhanced background effects */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20 space-y-6">
            <div className="inline-block">
              <h2 className="text-5xl lg:text-6xl font-bold text-white tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
                {t.portfolio.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {t.portfolio.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Personal Project */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500 h-full" onClick={() => {
              navigate('/personal-project');
              window.scrollTo(0, 0);
            }}>
              <div className="text-center space-y-6 h-full flex flex-col justify-between">
                {/* Modern Square Container with Video */}
                <div className="relative w-72 h-72 mx-auto">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 opacity-90"></div>
                  
                  {/* Main container with video */}
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-2xl backdrop-blur-xl border border-blue-500/20 group-hover:border-blue-400/40 transition-all duration-500 overflow-hidden">
                    {/* Personal Project Video */}
                    <img 
                      src="/project-thumbnail.webp"
                      alt="PTSC Hai Phong Industrial Operations"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                    />
                    
                    {/* Fallback content if video fails to load */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60" style={{display: 'none'}}>
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-blue-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-blue-500/40 transition-colors duration-300 backdrop-blur-sm border border-blue-400/30">
                          <Camera className="w-12 h-12 text-blue-200" />
                        </div>
                        <div className="space-y-3">
                          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-500 mx-auto rounded-full shadow-lg"></div>
                          <div className="w-12 h-1 bg-gradient-to-r from-blue-400/60 to-blue-500/60 mx-auto rounded-full"></div>
                          <div className="w-8 h-1 bg-gradient-to-r from-blue-400/30 to-blue-500/30 mx-auto rounded-full"></div>
                        </div>
                        <div className="text-sm font-medium text-blue-200 tracking-wider uppercase bg-blue-900/50 px-3 py-1 rounded-full backdrop-blur-sm">Portfolio</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced decorative elements */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300 shadow-lg"></div>
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl opacity-60 group-hover:opacity-90 group-hover:-rotate-12 transition-all duration-300 shadow-lg"></div>
                </div>
                
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">{t.portfolio.personal.title}</h3>
                    <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed max-w-xs mx-auto transition-colors duration-300 min-h-[3rem]">
                      {t.portfolio.personal.description}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 font-medium px-6 py-3 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                      {t.portfolio.personal.button} <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Work */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500 h-full" onClick={() => {
              navigate('/commercial-work');
              window.scrollTo(0, 0);
            }}>
              <div className="text-center space-y-6 h-full flex flex-col justify-between">
                {/* Modern Square Container with Image */}
                <div className="relative w-72 h-72 mx-auto">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-500 group-hover:scale-110 opacity-90"></div>
                  
                  {/* Main container with image */}
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-2xl backdrop-blur-xl border border-orange-500/20 group-hover:border-orange-400/40 transition-all duration-500 overflow-hidden">
                    {commercialLoading ? (
                      // Loading state
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl animate-pulse flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <Film className="w-12 h-12 text-orange-400/50 mx-auto animate-pulse" />
                          <div className="w-20 h-2 bg-orange-500/30 rounded mx-auto"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                    {/* Image Background */}
                    <img 
                          src={useLocalFallback ? "/PTSCHaiPhong7.webp" : getCommercialThumbnail()}
                          alt={getCommercialAltText()}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                          onError={(e) => {
                            console.error('Commercial thumbnail failed to load:', {
                              src: e.currentTarget.src,
                              originalData: featuredCommercial,
                              useLocalFallback
                            });
                            if (!useLocalFallback) {
                              setUseLocalFallback(true);
                              console.log('Switching to local fallback image');
                            }
                          }}
                          onLoad={() => {
                            console.log('Commercial thumbnail loaded successfully:', useLocalFallback ? "Local fallback" : getCommercialThumbnail());
                          }}
                    />
                    
                    {/* Overlay content */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-8 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60">
                      <div className="text-center space-y-6">
                        
                      </div>
                    </div>
                      </>
                    )}
                  </div>
                  
                  {/* Enhanced decorative elements */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300 shadow-lg"></div>
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl opacity-60 group-hover:opacity-90 group-hover:-rotate-12 transition-all duration-300 shadow-lg"></div>
                </div>
                
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-100 transition-colors duration-300">{t.portfolio.commercial.title}</h3>
                    <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed max-w-xs mx-auto transition-colors duration-300 min-h-[3rem]">
                      {t.portfolio.commercial.description}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 font-medium px-6 py-3 rounded-xl border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
                      {t.portfolio.commercial.button} <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Events */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500 h-full" onClick={() => {
              navigate('/events');
              window.scrollTo(0, 0);
            }}>
              <div className="text-center space-y-6 h-full flex flex-col justify-between">
                {/* Modern Square Container with Video */}
                <div className="relative w-72 h-72 mx-auto">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-2xl group-hover:shadow-green-500/50 transition-all duration-500 group-hover:scale-110 opacity-90"></div>
                  
                  {/* Main container with video */}
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-2xl backdrop-blur-xl border border-green-500/20 group-hover:border-green-400/40 transition-all duration-500 overflow-hidden">
                    {/* Video Background */}
                    <img 
                      src="/YEP_2025_TRAN_QUANG_3_01.webp"
                      alt="PTSC Hai Phong Industrial Operations"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                    />
                    
                    {/* Overlay content */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-8 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60">
                      
                    </div>
                  </div>
                  
                  {/* Enhanced decorative elements */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300 shadow-lg"></div>
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-br from-green-300 to-green-400 rounded-xl opacity-60 group-hover:opacity-90 group-hover:-rotate-12 transition-all duration-300 shadow-lg"></div>
                </div>
                
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors duration-300">{t.portfolio.events.title}</h3>
                    <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed max-w-xs mx-auto transition-colors duration-300 min-h-[3rem]">
                      {t.portfolio.events.description}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-500/20 font-medium px-6 py-3 rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
                      {t.portfolio.events.button} <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="py-16"></div>
      {/* Services Section */}
      {/* <section className="py-24 px-6 bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Dịch vụ</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Chuyên nghiệp - Sáng tạo - Đẳng cấp</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-8 rounded-2xl bg-gray-900 border border-gray-700 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Quay phim</h3>
              <p className="text-gray-400 text-sm">Video chất lượng cao</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gray-900 border border-gray-700 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Chụp ảnh</h3>
              <p className="text-gray-400 text-sm">Hình ảnh chuyên nghiệp</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gray-900 border border-gray-700 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Film className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Post Production</h3>
              <p className="text-gray-400 text-sm">Chỉnh sửa và hoàn thiện</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gray-900 border border-gray-700 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Image className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Creative Direction</h3>
              <p className="text-gray-400 text-sm">Ý tưởng sáng tạo</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-white tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
                {t.contact.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Enhanced Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Email Card */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-blue-500/30">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
                      Email
                    </h3>
                    <a 
                      href="mailto:tunguyenfilm@gmail.com" 
                      className="block text-gray-300 group-hover:text-white font-medium text-lg transition-colors duration-300 hover:underline"
                    >
                      tunguyenfilm@gmail.com
                    </a>
                  </div>

                  <Button 
                    onClick={() => window.open('mailto:tunguyenfilm@gmail.com', '_blank')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
                  >
                    {language === 'vi' ? 'Bắt đầu ngay' : 'Get Started'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg opacity-40 group-hover:opacity-80 group-hover:-rotate-12 transition-all duration-300"></div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 hover:border-green-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-green-500/30">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-green-100 transition-colors duration-300">
                      {language === 'vi' ? 'Điện thoại' : 'Phone'}
                    </h3>
                    <a 
                      href="tel:0387990332" 
                      className="block text-gray-300 group-hover:text-white font-medium text-lg transition-colors duration-300 hover:underline"
                    >
                      0387990332
                    </a>
                  </div>

                  <Button 
                    onClick={() => window.open('tel:0387990332', '_blank')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/30"
                  >
                    {language === 'vi' ? 'Gọi ngay' : 'Call Now'}
                    <Phone className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-xl opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-300 to-green-400 rounded-lg opacity-40 group-hover:opacity-80 group-hover:-rotate-12 transition-all duration-300"></div>
              </div>
            </div>
          </div>

          {/* Social Media & Additional Contact */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {language === 'vi' ? 'Kết nối với chúng tôi' : 'Connect with us'}
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {language === 'vi' 
                  ? 'Theo dõi chúng tôi trên các nền tảng mạng xã hội để cập nhật những dự án mới nhất'
                  : 'Follow us on social media platforms to stay updated with our latest projects'
                }
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center space-x-6">
              <a 
                href="https://www.facebook.com/share/1DiibpAwPB/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4 hover:border-orange-400/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Facebook className="w-8 h-8 text-orange-400 group-hover:text-orange-300 transition-colors duration-300 relative z-10" />
              </a>
              
              <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Video className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300 relative z-10" />
              </div>
              
              <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Camera className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300 relative z-10" />
              </div>
            </div>

            {/* Call to Action */}
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-black border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Section 1: Company Info */}
            <div className="space-y-6">
              <div className="mb-4">
                <img 
                  src="/logo_transparent.png" 
                  alt="TN Films Logo" 
                  className="h-40 w-auto hover:scale-105 transition-all duration-300 cursor-pointer filter drop-shadow-lg"
                />
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                {t.footer.description}
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors cursor-pointer">
                  <Camera className="w-5 h-5 text-blue-400" />
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center hover:bg-purple-500/30 transition-colors cursor-pointer">
                  <Film className="w-5 h-5 text-purple-400" />
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/30 transition-colors cursor-pointer">
                  <Video className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Section 2: Services & Contact */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {t.footer.servicesTitle}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <a href="mailto:tunguyenfilm@gmail.com" className="hover:underline">
                    Email: tunguyenfilm@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-orange-400" />
                  </div>
                  <a href="https://www.facebook.com/share/1DiibpAwPB/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    TuNguyen Film fanpage
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <a href="tel:0387990332" className="hover:underline">
                    0387990332
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
