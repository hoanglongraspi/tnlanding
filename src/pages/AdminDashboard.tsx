import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Camera, 
  Film, 
  Calendar, 
  Users, 
  Eye, 
  Settings, 
  LogOut,
  Plus,
  BarChart3,
  Database,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Building2,
  HardDrive
} from "lucide-react";
import PortfolioManager from "@/components/admin/PortfolioManager";
import CompaniesManager from "@/components/admin/CompaniesManager";
import MediaManager from "@/components/admin/MediaManager";
import { analyticsService, checkDatabaseSetup } from "@/lib/database-service";
import { isSupabaseConfigured, getConfigurationStatus } from "@/lib/supabase";
import { verifyAuthToken, clearAuth } from "@/lib/auth-service";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Check Supabase configuration
  const configStatus = getConfigurationStatus();

  // Fetch dashboard analytics from Supabase
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: analyticsService.getDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: configStatus.configured, // Only run query if Supabase is configured
  });

  useEffect(() => {
    // Check authentication with secure token verification
    if (!verifyAuthToken()) {
      clearAuth();
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate("/admin/login");
  };

  // Show setup instructions if Supabase is not configured
  if (!configStatus.configured) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">TN Films CMS</h1>
                  <p className="text-sm text-gray-400">Portfolio Management System</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-sm">Setup Required</span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="text-gray-300 hover:text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Website
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Setup Instructions */}
          <Card className="bg-orange-500/10 border-orange-500/20 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-2xl">CMS Setup Required</h2>
                  <p className="text-orange-200 text-sm font-normal">Configure Supabase to start managing your portfolio</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    Create Supabase Project
                  </h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p>• Go to <span className="text-blue-400">supabase.com</span></p>
                    <p>• Create a new project</p>
                    <p>• Wait for it to be ready</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    Get Your Credentials
                  </h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p>• Settings → API in Supabase</p>
                    <p>• Copy Project URL</p>
                    <p>• Copy Anon Public Key</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                    Environment Variables
                  </h3>
                  <div className="text-gray-300 space-y-3 text-sm">
                    <p>Create <span className="text-yellow-400">.env.local</span> file:</p>
                    <div className="bg-gray-900/80 rounded p-3 font-mono text-xs border border-gray-700">
                      <div className="text-green-400">VITE_SUPABASE_URL=your-url</div>
                      <div className="text-green-400">VITE_SUPABASE_ANON_KEY=your-key</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                    Setup Database
                  </h3>
                  <div className="text-gray-300 space-y-2 text-sm">
                    <p>• SQL Editor in Supabase</p>
                    <p>• Paste <span className="text-yellow-400">database.sql</span> content</p>
                    <p>• Click Run</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <Button
                  onClick={() => window.open('https://supabase.com', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase
                </Button>
                
                <div className="text-right">
                  <p className="text-gray-400 text-sm">After setup, restart your dev server</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Camera className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Personal Projects</p>
                      <p className="text-white text-2xl font-bold">
                        {analytics?.portfolio?.personal || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Film className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Commercial Work</p>
                      <p className="text-white text-2xl font-bold">
                        {analytics?.portfolio?.commercial || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Events</p>
                      <p className="text-white text-2xl font-bold">
                        {analytics?.portfolio?.events || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Items */}
            {analytics?.recentItems && analytics.recentItems.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Portfolio Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{item.title}</p>
                          <p className="text-gray-400 text-sm capitalize">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "personal":
        return <PortfolioManager category="personal" />;
      
      case "commercial":
        return <CompaniesManager />;
      
      case "events":
        return <PortfolioManager category="events" />;

      case "media":
        return <MediaManager />;

      default:
        return <div className="text-white">Tab not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TN Films CMS</h1>
                <p className="text-sm text-gray-400">Portfolio Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Connected</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Website
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/30 p-1 rounded-lg">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "personal", label: "Personal", icon: Camera },
            { id: "commercial", label: "Commercial", icon: Film },
            { id: "events", label: "Events", icon: Calendar },
           
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 