import { CMSContent, CMSSection } from "@/components/CMSContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Globe } from "lucide-react";

const CMSDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">CMS Content Demo</h1>
                <p className="text-sm text-gray-400">Live content from your CMS</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Content
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section Demo */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Hero Section (CMS Controlled)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg">
              <CMSContent 
                section="hero-title"
                fallback="Tu Nguyen Film"
                className="text-4xl md:text-6xl font-bold text-white mb-4 block"
              />
              <CMSContent 
                section="hero-subtitle"
                fallback="Professional Photography & Videography"
                className="text-xl text-gray-300 mb-8 block max-w-2xl mx-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* About Section Demo */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">About Section (CMS Controlled)</CardTitle>
          </CardHeader>
          <CardContent>
            <CMSSection
              section="about-title"
              fallbackTitle="About Us"
              fallbackContent="We are a professional photography and videography team dedicated to capturing your most precious moments."
              titleClassName="text-2xl font-bold text-white mb-4"
              contentClassName="text-gray-300 leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Services Section Demo */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Services Section (CMS Controlled)</CardTitle>
          </CardHeader>
          <CardContent>
            <CMSSection
              section="services-title"
              fallbackTitle="Our Services"
              fallbackContent="We offer comprehensive photography and videography services including weddings, events, commercial work, and personal projects."
              titleClassName="text-2xl font-bold text-white mb-4"
              contentClassName="text-gray-300 leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Contact Section Demo */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Contact Section (CMS Controlled)</CardTitle>
          </CardHeader>
          <CardContent>
            <CMSSection
              section="contact-title"
              fallbackTitle="Get In Touch"
              fallbackContent="Ready to work together? Contact us to discuss your project and bring your vision to life."
              titleClassName="text-2xl font-bold text-white mb-4"
              contentClassName="text-gray-300 leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="text-white font-semibold mb-3">How to use this CMS:</h3>
          <div className="text-blue-200 space-y-2 text-sm">
            <p>1. Go to the Admin Dashboard and click on "Content" tab</p>
            <p>2. Add or edit content sections like "hero-title", "hero-subtitle", "about-title", etc.</p>
            <p>3. The content will automatically update here in real-time</p>
            <p>4. You can use the same components in your actual landing page to replace hardcoded text</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSDemo; 