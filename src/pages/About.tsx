import { Camera, Film, Video, Award, Users, Heart, Globe, ArrowLeft, ChevronLeft, Calendar, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const About = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('vi');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Images from the public folder
  const aboutImages = [
    '/TNF.webp', 
    '/2A7A7439.webp',
    '/DSC01836.webp',
    '/IMG_0082.webp'
  ];

  // Auto-play image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const playDemoReel = () => {
    setIsPlaying(true);
    // Add demo reel logic here
  };

  const content = {
    vi: {
      nav: {
        home: 'Trang chủ',
        about: 'Về chúng tôi',
        contact: 'Liên hệ'
      },
      hero: {
        title: 'Về chúng tôi',
        subtitle: 'Câu chuyện của Tú Nguyễn Film'
      },
      story: {
        greeting: 'Xin chào! Tôi là Nguyễn Minh Tú',
        intro: 'hay còn được mọi người biết đến với cái tên thân thuộc Tú Nguyễn – người sáng lập Tu Nguyen Film Co.,Ltd.',
        background: 'Tôi tốt nghiệp chuyên ngành Tự động hóa tại Cao đẳng Dầu khí, tôi bắt đầu sự nghiệp tại Vũng Tàu trong giai đoạn 2018–2020. Và rồi tôi đã tìm thấy niềm đam mê mới với ngành truyền thông và sản xuất video – một lĩnh vực cho tôi cơ hội được kể chuyện, được kết nối cảm xúc và sáng tạo không giới hạn.',
        journey: 'Sau đó, tôi chuyển đến TP. Hồ Chí Minh để tiếp tục phát triển với vai trò là một freelancer. Nhờ sự học hỏi và giúp đỡ của tất cả mọi người ở Sài Gòn, tôi đã có cơ hội tham gia vào nhiều dự án và các sự kiện quy mô lớn của nhiều công ty và tập đoàn lớn để mang lại những sản phẩm chất lượng cho doanh nghiệp.',
        experience: 'Tôi từng bước va chạm thực tế, và may mắn có cơ hội đồng hành cùng nhiều cá nhân, doanh nghiệp, thương hiệu lớn nhỏ trong các dự án như:'
      },
      services: {
        title: 'Dịch vụ của chúng tôi',
        list: [
          'Video teambuilding, sự kiện, đám cưới',
          'Clip viral, TV Commercials',
          'Phim doanh nghiệp, phim tài liệu, phim giới thiệu sản phẩm'
        ]
      },
      mission: {
        title: 'Sứ mệnh của chúng tôi',
        description: 'Mỗi dự án là một hành trình đầy cảm xúc và thách thức – và tôi luôn tâm niệm phải mang đến chất lượng hình ảnh tốt nhất, câu chuyện rõ ràng nhất, và trải nghiệm chuyên nghiệp nhất cho khách hàng.'
      },
      company: {
        title: 'Tu Nguyen Film Co., Ltd',
        establishment: 'Sau nhiều năm làm việc, tôi chính thức thành lập Tu Nguyen Film Co., Ltd, như một bước tiến đánh dấu hành trình của bản thân tôi, khẳng định nghiêm túc trong lĩnh vực video production.',
        team: 'Với đội ngũ cộng sự sáng tạo, giàu kinh nghiệm, công ty chúng tôi cung cấp giải pháp toàn diện cho mọi nhu cầu sản xuất video:',
        capabilities: [
          'Lên ý tưởng, kịch bản (concept, scriptwriting)',
          'Quay phim (Camera Operator, Drone/Flycam)',
          'Dựng phim, hậu kỳ (Editing, VFX, Sound)',
          'Sản xuất trọn gói cho sự kiện, doanh nghiệp, thương hiệu'
        ],
        vision: 'Tôi luôn mong muốn Tu Nguyen Film Co., Ltd luôn là đơn vị mang lại hình ảnh giá trị cho doanh nghiệp,'
      }
    },
    en: {
      nav: {
        home: 'Home',
        about: 'About Us',
        contact: 'Contact'
      },
      hero: {
        title: 'About Us',
        subtitle: 'The Story of Tu Nguyen Film'
      },
      story: {
        greeting: 'Hello! I am Nguyen Minh Tu',
        intro: 'also known by the familiar name Tu Nguyen – founder of Tu Nguyen Film Co.,Ltd.',
        background: 'I graduated in Automation from Petroleum College and started my career in Vung Tau from 2018-2020. Then I discovered a new passion for media and video production – a field that gave me the opportunity to tell stories, connect emotions and create without limits.',
        journey: 'After that, I moved to Ho Chi Minh City to continue developing as a freelancer. Thanks to learning from and help from everyone in Saigon, I had the opportunity to participate in many projects and large-scale events of many large companies and corporations to deliver quality products for businesses.',
        experience: 'I gradually faced reality, and was fortunate to have the opportunity to accompany many individuals, businesses, and brands large and small in projects such as:'
      },
      services: {
        title: 'Our Services',
        list: [
          'Teambuilding videos, events, weddings',
          'Viral clips, TV Commercials',
          'Corporate films, documentaries, product introduction films'
        ]
      },
      mission: {
        title: 'Our Mission',
        description: 'Each project is a journey full of emotions and challenges – and I always believe in delivering the best image quality, clearest story, and most professional experience for customers.'
      },
      company: {
        title: 'Tu Nguyen Film Co., Ltd',
        establishment: 'After many years of work, I officially established Tu Nguyen Film Co., Ltd, as a step forward marking my personal journey, affirming seriousness in the field of video production.',
        team: 'With a team of creative, experienced collaborators, our company provides comprehensive solutions for all video production needs:',
        capabilities: [
          'Concept, scriptwriting',
          'Filming (Camera Operator, Drone/Flycam)',
          'Editing, post-production (Editing, VFX, Sound)',
          'Complete production for events, businesses, brands'
        ],
        vision: 'I always hope that Tu Nguyen Film Co., Ltd will always be the unit that brings valuable images to businesses,'
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.nav.home}
              </Button>
              <img 
                src="/logo_transparent.png" 
                alt="TN Films Logo" 
                className="h-16 w-auto hover:scale-105 transition-all duration-300 cursor-pointer filter drop-shadow-lg hover:drop-shadow-2xl"
                onClick={() => navigate('/')}
              />
            </div>
            <div className="flex items-center space-x-6">
              <a href="/#contact" className="text-gray-300 hover:text-white transition-colors font-medium">
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 z-0">
          {aboutImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`About Tu Nguyen Film ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Sections */}
      {/* Section 1: Introduction */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {t.story.greeting}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t.story.intro}
              </p>
            </div>
            <div className="relative">
              <img
                src="/Tú.webp"
                alt="Tu Nguyen"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Background - Reversed Layout */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src="/TNF.webp"
                alt="Tu Nguyen Film Background"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Film className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                {language === 'vi' ? 'Hành trình khởi đầu' : 'The Beginning'}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t.story.background}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Journey to HCMC */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {language === 'vi' ? 'Phát triển tại Sài Gòn' : 'Growing in Saigon'}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t.story.journey}
              </p>
            </div>
            <div className="relative">
              <img
                src="/2A7A7439.webp"
                alt="Tu Nguyen Film in Ho Chi Minh City"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Video className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/logo_transparent.png" 
              alt="TN Films Logo" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-gray-400">
            © 2024 Tú Nguyễn Film. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About; 