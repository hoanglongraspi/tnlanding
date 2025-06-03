import { Film, ArrowLeft, ChevronRight, Play, X, Folder, Building2, Eye, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { companyService, companyGalleryService } from "@/lib/database-service";
import { convertVideoUrl } from "@/lib/utils";
import { Company, CompanyGallery } from "@/lib/supabase";
import Slideshow from "@/components/ui/slideshow";
import Modal from "@/components/ui/Modal";

const CommercialWork = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ 
    src: string; 
    title: string; 
    type: 'image' | 'video' | 'slideshow';
    images?: string[];
  } | null>(null);

  // Fetch companies from CMS
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll('published'),
  });

  // Fetch gallery for selected company
  const { data: companyGallery = [], isLoading: galleryLoading } = useQuery({
    queryKey: ['company-gallery', selectedCompany?.id],
    queryFn: () => selectedCompany ? companyGalleryService.getByCompanyId(selectedCompany.id, 'published') : Promise.resolve([]),
    enabled: !!selectedCompany,
  });

  const openMediaModal = (item: CompanyGallery) => {
    if (item.media_type === 'image' && item.images && item.images.length > 0) {
      setSelectedMedia({ 
        src: item.images[0], 
        title: item.title, 
        type: 'slideshow',
        images: item.images
      });
    } else {
      const processedSrc = item.media_type === 'video' ? convertVideoUrl(item.media_url) : item.media_url;
      setSelectedMedia({ 
        src: processedSrc, 
        title: item.title, 
        type: item.media_type
      });
    }
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  const closeCompanyModal = () => {
    setSelectedCompany(null);
  };

  if (companiesError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Companies</h2>
          <p className="text-gray-400">Failed to load company data. Please check your CMS configuration.</p>
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
      {/* Full Screen Media Modal */}
      <Modal
        isOpen={!!selectedMedia}
        onClose={closeMediaModal}
        className="flex items-center justify-center"
      >
        {selectedMedia && (
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedMedia.type === 'video' ? (
              <iframe
                src={selectedMedia.src}
                className="max-w-[90vw] max-h-[80vh] w-full aspect-video rounded-lg shadow-2xl"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ border: 'none' }}
              />
            ) : selectedMedia.type === 'slideshow' ? (
              <Slideshow 
                images={selectedMedia.images || []} 
                title={selectedMedia.title}
                autoPlay={false}
                showFrame={true}
                showControls={true}
                showIndicators={true}
                className="max-w-[95vw] max-h-[90vh]"
              />
            ) : (
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            
            {/* Media Info */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 border border-orange-400/30">
              <h3 className="text-white font-semibold text-lg">{selectedMedia.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {selectedMedia.type === 'video' ? 
                  <Video className="w-4 h-4 text-orange-400" /> : 
                  selectedMedia.type === 'slideshow' ? (
                    <div className="flex items-center space-x-1">
                      <Image className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-300 text-sm">Gallery ({selectedMedia.images?.length || 0})</span>
                    </div>
                  ) : (
                    <Image className="w-4 h-4 text-orange-400" />
                  )
                }
                {selectedMedia.type !== 'slideshow' && (
                  <span className="text-orange-300 text-sm capitalize">{selectedMedia.type}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Company Gallery Modal */}
      <Modal
        isOpen={!!selectedCompany}
        onClose={closeCompanyModal}
        zIndex="z-[90]"
        className="bg-gray-900 rounded-2xl overflow-hidden"
      >
        {selectedCompany && (
          <div className="h-full overflow-y-auto">
            {/* Company Header */}
            <div className="p-8 border-b border-gray-800">
              <div className="flex items-center space-x-6">
                {/* Company Logo/Icon */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  style={{ backgroundColor: selectedCompany.folder_color }}
                >
                  {selectedCompany.logo_url ? (
                    <img 
                      src={selectedCompany.logo_url} 
                      alt={selectedCompany.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-10 h-10" />
                  )}
                </div>
                
                {/* Company Info */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">{selectedCompany.name}</h2>
                  <p className="text-gray-300 text-lg">{selectedCompany.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    {selectedCompany.industry && (
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-400">{selectedCompany.industry}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Gallery */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Gallery</h3>
                <p className="text-gray-400">Khám phá các dự án và nội dung đã thực hiện cho {selectedCompany.name}</p>
              </div>

              {galleryLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : companyGallery.length === 0 ? (
                <div className="text-center py-16">
                  <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">No content yet</h4>
                  <p className="text-gray-400">This company folder is empty. Content will appear here once added through CMS.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {companyGallery
                    .sort((a, b) => {
                      // First, sort by media type (videos first, then images)
                      if (a.media_type === 'video' && b.media_type === 'image') return -1;
                      if (a.media_type === 'image' && b.media_type === 'video') return 1;
                      
                      // If same media type, sort by sort_order, then by featured status
                      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
                      if (a.featured !== b.featured) return b.featured ? 1 : -1;
                      
                      return 0;
                    })
                    .map((item: CompanyGallery) => (
                      <div 
                        key={item.id} 
                        className="group relative cursor-pointer"
                        onClick={() => openMediaModal(item)}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 group-hover:border-orange-400/40 transition-all duration-300">
                          {/* Thumbnail */}
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white text-sm font-medium">{item.title}</p>
                              <p className="text-gray-300 text-xs">{item.description}</p>
                            </div>
                          </div>
                          
                          {/* Media Type Icon */}
                          <div className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                            {item.media_type === 'video' ? 
                              <Play className="w-4 h-4 text-white" /> :
                              item.media_type === 'image' && item.images && item.images.length > 1 ? (
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3 text-white" />
                                  <span className="text-white text-xs font-medium">{item.images.length}</span>
                                </div>
                              ) : (
                                <Eye className="w-4 h-4 text-white" />
                              )
                            }
                          </div>
                          
                          {/* Featured Badge */}
                          {item.featured && (
                            <div className="absolute top-2 left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">★</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="text-white hover:bg-gray-800 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
          <h1 className="text-2xl font-bold text-white">Commercial Work</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen py-16 relative">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/PTSCHaiPhong7.webp"
            alt="PTSC Hai Phong Industrial Operations"
            className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
              <Film className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Commercial Work</h2>
            {/* <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Khám phá các dự án thương mại được tổ chức theo từng đối tác. 
              Mỗi folder chứa bộ sưu tập ảnh và video được thực hiện cho công ty đó.
            </p> */}
          </div>

          {/* Company Folders Section */}
          <div className="mb-20">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500/10 via-orange-500/20 to-orange-500/10 px-10 py-4 rounded-full border border-orange-400/20 mb-10 backdrop-blur-sm">
                <Folder className="w-6 h-6 text-orange-400" />
                <span className="text-orange-300 text-lg font-semibold tracking-wider uppercase">Company Folders</span>
              </div>
              <h3 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-orange-200 to-blue-200 bg-clip-text text-transparent mb-8 leading-tight">
                Đối tác của chúng tôi
              </h3>
              <p className="text-gray-300 max-w-4xl mx-auto text-xl leading-relaxed font-light">
                Khám phá gallery dự án độc đáo được thực hiện cùng từng đối tác chiến lược
              </p>
            </div>

            {/* Loading State */}
            {companiesLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="group">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/30 animate-pulse">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-40 h-40 bg-gray-700/50 rounded-full"></div>
                        <div className="space-y-3 text-center w-full">
                          <div className="h-6 bg-gray-700/50 rounded-lg w-32 mx-auto"></div>
                          <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Companies State */}
            {!companiesLoading && companies.length === 0 && (
              <div className="text-center py-24">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/30 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mx-auto mb-8 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Chưa có công ty nào</h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">Thêm công ty qua CMS để tạo company folders</p>
                  <Button 
                    onClick={() => navigate('/admin')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Truy cập CMS
                  </Button>
                </div>
              </div>
            )}

            {/* Companies Grid */}
            {!companiesLoading && companies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                {companies.map((company: Company) => (
                  <div 
                    key={company.id} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedCompany(company)}
                  >
                    {/* Company Card */}
                    <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/20 hover:border-gray-600/40 transition-all duration-500 hover:bg-gray-800/30 group-hover:scale-[1.02] group-hover:shadow-2xl">
                      
                      {/* Company Logo Circle */}
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          {/* Subtle Glow Effect */}
                          <div 
                            className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-25 blur-xl transition-all duration-700"
                            style={{ backgroundColor: company.folder_color }}
                          ></div>

                          {/* Outer Ring Effect */}
                          <div 
                            className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"
                            style={{ backgroundColor: company.folder_color }}
                          ></div>
                          
                          {/* Main Logo Circle */}
                          <div 
                            className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-2xl border border-white/4 group-hover:border-white/8 transition-all duration-500 overflow-hidden group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-sm"
                            style={{ backgroundColor: company.folder_color }}
                          >
                            {company.logo_url ? (
                              <div className="relative">
                                {/* Logo Background Glow */}
                                <div className="absolute inset-0 w-36 h-36 rounded-full bg-white/5 blur-sm group-hover:bg-white/10 transition-all duration-500"></div>
                                
                                <img 
                                  src={company.logo_url} 
                                  alt={company.name}
                                  className="relative w-36 h-36 rounded-full object-cover border border-white/5 group-hover:border-white/10 transition-all duration-500 group-hover:scale-110 shadow-2xl group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] group-hover:brightness-110 group-hover:contrast-110"
                                />
                                
                                {/* Logo Inner Shine */}
                                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                              </div>
                            ) : (
                              <div className="text-center text-white relative">
                                {/* Icon Glow Background */}
                                <div className="absolute inset-0 bg-white/5 rounded-full blur-sm group-hover:bg-white/15 transition-all duration-500"></div>
                                
                                <Building2 className="relative w-20 h-20 mb-2 transition-all duration-500 group-hover:scale-125 drop-shadow-2xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] filter group-hover:brightness-125" />
                                <div className="relative text-xl font-bold tracking-wide drop-shadow-lg group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-500 group-hover:scale-110">
                                  {company.name.substring(0, 4)}
                                </div>
                              </div>
                            )}
                            
                            {/* Subtle Corner Icon */}
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/8 group-hover:scale-125 transition-all duration-300 group-hover:bg-white/15 group-hover:shadow-lg">
                              <Folder className="w-4 h-4 text-white drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300" />
                            </div>

                            {/* Elegant Static Particles */}
                            <div className="absolute inset-0 rounded-full pointer-events-none">
                              <div className="absolute top-3 left-3 w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-all duration-500"></div>
                              <div className="absolute bottom-4 right-5 w-1.5 h-1.5 bg-white/25 rounded-full group-hover:bg-white/45 transition-all duration-500"></div>
                              <div className="absolute top-1/2 left-1 w-1 h-1 bg-white/35 rounded-full group-hover:bg-white/55 transition-all duration-500"></div>
                              <div className="absolute top-6 right-3 w-0.5 h-0.5 bg-white/30 rounded-full group-hover:bg-white/50 transition-all duration-500"></div>
                            </div>

                            {/* Subtle Rotating Ring Effect */}
                            <div className="absolute inset-0 rounded-full border border-white/3 group-hover:border-white/10 transition-all duration-700 group-hover:rotate-12"></div>

                            {/* Inner Radial Glow */}
                            <div className="absolute inset-1 rounded-full bg-gradient-radial from-white/8 via-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
                          </div>
                        </div>

                        {/* Company Information */}
                        <div className="text-center space-y-4 w-full">
                          {/* Company Name */}
                          <h4 className="text-2xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300">
                            {company.name}
                          </h4>
                          
                          
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialWork; 