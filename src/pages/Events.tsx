import { ArrowLeft, Play, MapPin, Users, Star, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/lib/database-service";
import { convertVideoUrl, getThumbnailUrl } from "@/lib/utils";
import MediaSlider from "@/components/ui/MediaSlider";

const Events = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch events projects from CMS
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['portfolio', 'events'],
    queryFn: () => portfolioService.getAll('events', 'published'),
  });

  // Background images for the gallery - now using WebP format
  const backgroundImages = [
    '/YEP_2025_TRAN_QUANG_3_01.webp',  // Main events image
    '/DSCF3135.webp',
    '/DSC01742.webp'
  ];

  // Auto-play image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Format project data for the UI
  const formatProjectForUI = (project) => {
    let thumbnail = project.image_url ? getThumbnailUrl(project.image_url) : null;
    
    // If no image_url but has video_url, try to use video thumbnail
    if (!thumbnail && project.video_url) {
      if (project.video_url.includes('drive.google.com')) {
        // For Google Drive videos, use a default event thumbnail
        thumbnail = '/YEP_2025_TRAN_QUANG_3_01.webp';
      }
    }
    
    // Final fallback
    if (!thumbnail) {
      thumbnail = '/YEP_2025_TRAN_QUANG_3_01.webp';
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description || "Sự kiện đặc biệt được ghi lại với chất lượng chuyên nghiệp, tạo nên những khoảnh khắc đáng nhớ.",
      videoUrl: project.video_url ? convertVideoUrl(project.video_url) : null,
      thumbnail: thumbnail,
      images: project.images || [], // Include additional images
      duration: "4:20",
      category: "Events",
      status: project.status === 'published' ? "Published" : "Draft",
      featured: project.featured,
      location: "Hồ Chí Minh, Vietnam",
      formattedDate: new Date(project.date).toLocaleDateString('vi-VN'),
      tags: project.tags || []
    };
  };

  const formattedProjects = projects.map(formatProjectForUI);

  const handleImageError = (e: any) => {
    console.error('Image failed to load:', e.target.src);
    // Fallback to default image
    e.target.src = '/YEP_2025_TRAN_QUANG_3_01.webp';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Projects</h2>
          <p className="text-gray-400">Failed to load events projects. Please check your CMS configuration.</p>
          <Button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="text-white hover:bg-gray-800 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-6">
          {/* Page Title */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Heart className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Event Gallery</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Khám phá những dự án sự kiện đã thực hiện với chất lượng và sự sáng tạo
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Projects State */}
          {!isLoading && formattedProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-700/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Events Yet</h3>
              <p className="text-gray-400 mb-6">Add event projects through the CMS to see them here.</p>
              <Button 
                onClick={() => navigate('/admin')}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to CMS
              </Button>
            </div>
          )}

          {/* Events Alternating Layout */}
          {!isLoading && formattedProjects.length > 0 && (
            <div className="max-w-7xl mx-auto space-y-24">
              {formattedProjects.map((project, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <div 
                    key={project.id} 
                    className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                      isEven ? '' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Media Section */}
                    <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'} space-y-6`}>
                      <div className="group cursor-pointer" onClick={() => setSelectedProject(project)}>
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:scale-105">
                          <img 
                            src={project.thumbnail} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300 bg-white/20 backdrop-blur-sm rounded-full p-4">
                              {project.videoUrl ? (
                                <Play className="w-8 h-8 text-white" />
                              ) : (
                                <Heart className="w-8 h-8 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Media Count & Featured Badge */}
                      <div className="flex items-center justify-between">
                        {(project.videoUrl || project.images.length > 0) && (
                          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
                            <span className="text-gray-300 text-sm font-medium">
                              {(project.videoUrl ? 1 : 0) + project.images.length + 1} media files
                            </span>
                          </div>
                        )}
                        
                        {project.featured && (
                          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/30">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-sm font-medium">Featured Event</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'} space-y-8`}>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="inline-flex items-center space-x-2 bg-green-500/20 rounded-full px-4 py-2 text-green-400 border border-green-500/30">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">{project.category}</span>
                          </div>
                          
                          <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {project.title}
                          </h3>
                          
                          <p className="text-lg text-gray-300 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Event Details */}
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legacy Event Item - Keep if no CMS projects */}
          {!isLoading && formattedProjects.length === 0 && (
            <div className="max-w-full mx-auto px-4">
              <div className="grid lg:grid-cols-4 gap-20 items-start">
                {/* Video Section - Left */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl transform scale-105">
                    <iframe
                      src="https://drive.google.com/file/d/1p_70CHWbv02hdWpV4S99nBInglNm8kta/preview"
                      className="w-full h-full"
                      allow="autoplay"
                      title="Event Video"
                    ></iframe>
                  </div>
                </div>

                {/* Content Section - Right */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-green-500/20 rounded-full px-4 py-2 text-green-400">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">Event Coverage</span>
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                      Corporate Event
                    </h3>
                    
                    <p className="text-xl text-gray-300 leading-relaxed">
                      Sự kiện doanh nghiệp được thực hiện với chất lượng chuyên nghiệp, 
                      ghi lại những khoảnh khắc quan trọng và tạo nên những thước phim ấn tượng.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-gray-400">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span>Hồ Chí Minh, Vietnam</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-white">Dịch vụ đã thực hiện:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Quay phim sự kiện toàn bộ</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Chụp ảnh các khoảnh khắc quan trọng</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Hậu kỳ và chỉnh sửa chuyên nghiệp</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Highlight video và documentation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
              <Button 
                onClick={() => setSelectedProject(null)}
                variant="ghost" 
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Media Slider */}
              <MediaSlider
                videoUrl={selectedProject.videoUrl}
                thumbnailUrl={selectedProject.thumbnail}
                images={selectedProject.images}
                title={selectedProject.title}
                className="mb-8"
              />

              {/* Event Details */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Heart className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Event Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="text-green-400 text-sm font-medium mb-1">Description</div>
                    <div className="text-gray-300 text-sm leading-relaxed">{selectedProject.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events; 