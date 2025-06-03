import { Camera, ArrowLeft, ChevronRight, Play, Users, Award, Video, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/lib/database-service";
import { convertVideoUrl } from "@/lib/utils";
import MediaSlider from "@/components/ui/MediaSlider";

const PersonalProject = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch personal projects from CMS
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['portfolio', 'personal'],
    queryFn: () => portfolioService.getAll('personal', 'published'),
  });

  // Background images for the gallery - now using WebP format
  const backgroundImages = [
    '/project-thumbnail.webp',  // Main project image
    '/DSC01742.webp',
    '/DSCF3135.webp'
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
    // Generate thumbnail - prefer image_url, then fallback
    let thumbnail = project.image_url;
    
    // If no image_url but has video_url, try to use video thumbnail
    if (!thumbnail && project.video_url) {
      if (project.video_url.includes('drive.google.com')) {
        // For Google Drive videos, use a default project thumbnail
        thumbnail = '/project-thumbnail.webp';
      }
    }
    
    // Final fallback
    if (!thumbnail) {
      thumbnail = '/project-thumbnail.webp';
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description || "Dự án cá nhân độc đáo, thể hiện phong cách nghệ thuật và tầm nhìn sáng tạo.",
      videoUrl: project.video_url ? convertVideoUrl(project.video_url) : null,
      thumbnail: thumbnail,
      images: project.images || [], // Include additional images
      duration: "5:30", // You can add this to CMS later
      category: "Personal Project",
      status: project.status === 'published' ? "Published" : "Draft",
      featured: project.featured
    };
  };

  const formattedProjects = projects.map(formatProjectForUI);

  const handleImageError = (e: any) => {
    console.error('Image failed to load:', e.target.src);
    // Fallback to default image
    e.target.src = '/project-thumbnail.webp';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Projects</h2>
          <p className="text-gray-400">Failed to load personal projects. Please check your CMS configuration.</p>
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
            onClick={() => {
              navigate('/');
              window.scrollTo(0, 0);
            }}
            variant="ghost" 
            className="text-white hover:bg-gray-800 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
          <h1 className="text-2xl font-bold text-white">Personal Projects</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-6">
          {/* Gallery Header */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Camera className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Personal Project Gallery</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Bộ sưu tập các dự án cá nhân độc đáo, thể hiện phong cách nghệ thuật và tầm nhìn sáng tạo của chúng tôi.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center mb-16">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
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
            </div>
          )}

          {/* No Projects State */}
          {!isLoading && formattedProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-700/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Personal Projects Yet</h3>
              <p className="text-gray-400 mb-6">Add some personal projects through the CMS to see them here.</p>
              <Button 
                onClick={() => navigate('/admin')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to CMS
              </Button>
            </div>
          )}

          {/* Projects Gallery Grid */}
          {!isLoading && formattedProjects.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {formattedProjects.map((project) => (
                <div key={project.id} className="group cursor-pointer" onClick={() => setSelectedProject(project)}>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                    {/* Project Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                      <img 
                        src={project.thumbnail} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          {project.videoUrl ? <Play className="w-12 h-12 text-white" /> : <Camera className="w-12 h-12 text-white" />}
                        </div>
                      </div>

                      {/* Project Info Overlay */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-white text-sm font-medium">{project.category}</span>
                        </div>
                        {/* Media count indicator */}
                        {(project.videoUrl || project.images.length > 0) && (
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
                            <span className="text-white text-sm font-medium">
                              {(project.videoUrl ? 1 : 0) + project.images.length + 1} media
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {project.featured && (
                        <div className="absolute bottom-4 left-4 bg-yellow-500/80 backdrop-blur-sm rounded-lg px-3 py-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">Featured</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

              {/* Project Details */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Project Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="text-blue-400 text-sm font-medium mb-1">Description</div>
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

export default PersonalProject; 