import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Save, 
  Edit, 
  Plus,
  Globe,
  Type,
  Code,
  FileText,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/lib/database-service";
import { SiteContent } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ContentManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    title: "",
    content: "",
    type: "text" as "text" | "html" | "json"
  });

  // Fetch all content
  const { data: contentItems = [], isLoading, error } = useQuery({
    queryKey: ['site-content'],
    queryFn: contentService.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: contentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast({
        title: "Success",
        description: "Content created successfully.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create content: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ key, updates }: { key: string; updates: Partial<SiteContent> }) =>
      contentService.update(key, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast({
        title: "Success",
        description: "Content updated successfully.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update content: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contentData = {
      key: formData.key,
      title: formData.title,
      content: formData.content,
      type: formData.type
    };

    if (editingContent) {
      updateMutation.mutate({ key: editingContent.key, updates: contentData });
    } else {
      createMutation.mutate(contentData);
    }
  };

  const handleEdit = (item: SiteContent) => {
    setEditingContent(item);
    setFormData({
      key: item.key,
      title: item.title,
      content: item.content || "",
      type: item.type
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      key: "",
      title: "",
      content: "",
      type: "text"
    });
    setEditingContent(null);
    setIsDialogOpen(false);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <Type className="w-4 h-4" />;
      case "html": return <Code className="w-4 h-4" />;
      case "json": return <FileText className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "text": return "text-blue-400";
      case "html": return "text-orange-400";
      case "json": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  // Predefined content sections
  const predefinedSections = [
    { key: "hero_title", title: "Hero Title", type: "text" as const },
    { key: "hero_subtitle", title: "Hero Subtitle", type: "text" as const },
    { key: "hero_description", title: "Hero Description", type: "text" as const },
    { key: "about_title", title: "About Title", type: "text" as const },
    { key: "about_text", title: "About Text", type: "html" as const },
    { key: "services_title", title: "Services Title", type: "text" as const },
    { key: "contact_email", title: "Contact Email", type: "text" as const },
    { key: "contact_phone", title: "Contact Phone", type: "text" as const },
    { key: "social_instagram", title: "Instagram URL", type: "text" as const },
    { key: "social_youtube", title: "YouTube URL", type: "text" as const },
  ];

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Content</h3>
            <p className="text-gray-400 mb-6">
              Failed to load website content. Please check your Supabase configuration.
            </p>
            <p className="text-red-400 text-sm">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Website Content</h2>
            <p className="text-gray-400">Manage your website's dynamic content</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => setEditingContent(null)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingContent ? "Edit Content" : "Add New Content"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key" className="text-white">Key *</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({...formData, key: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="hero_title"
                    required
                    disabled={!!editingContent}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Unique identifier for this content
                  </p>
                </div>

                <div>
                  <Label htmlFor="type" className="text-white">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value as "text" | "html" | "json"})}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="text" className="text-white">Text</SelectItem>
                      <SelectItem value="html" className="text-white">HTML</SelectItem>
                      <SelectItem value="json" className="text-white">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="content" className="text-white">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                    placeholder={formData.type === "html" ? "<p>Your HTML content here</p>" : "Enter your content here"}
                  />
                  {formData.type === "html" && (
                    <p className="text-xs text-gray-400 mt-1">
                      You can use HTML tags for formatting
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Add Predefined Sections */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Add Common Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {predefinedSections.map((section) => {
              const exists = contentItems.some(item => item.key === section.key);
              return (
                <Button
                  key={section.key}
                  variant="outline"
                  size="sm"
                  disabled={exists}
                  onClick={() => {
                    setFormData({
                      key: section.key,
                      title: section.title,
                      content: "",
                      type: section.type
                    });
                    setIsDialogOpen(true);
                  }}
                  className={`justify-start ${
                    exists 
                      ? "border-green-500/30 bg-green-500/10 text-green-400" 
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {exists ? (
                    <Check className="w-3 h-3 mr-2" />
                  ) : (
                    <Plus className="w-3 h-3 mr-2" />
                  )}
                  {section.title}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-700 rounded w-2/3 mb-2" />
                <div className="h-16 bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contentItems.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Globe className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Content Yet</h3>
              <p className="text-gray-400 mb-6">
                Start by adding your first website content section.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Content
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {contentItems.map((item) => (
            <Card key={item.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getContentTypeColor(item.type)}`}>
                      {getContentTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <p className="text-gray-400 text-xs">{item.key}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      className="text-blue-400 hover:bg-blue-500/20"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-3 mb-3">
                  {item.type === "html" ? (
                    <div 
                      className="text-gray-300 text-sm"
                      dangerouslySetInnerHTML={{ __html: item.content || "" }}
                    />
                  ) : (
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {item.content || "No content"}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${getContentTypeColor(item.type)} bg-gray-700/50`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span>
                    Updated {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Instructions */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">How to Use Content Management</h4>
              <div className="text-blue-200 text-sm space-y-1">
                <p>• Create content with unique keys (e.g., "hero_title", "about_text")</p>
                <p>• Use "text" type for simple text, "html" for formatted content, "json" for structured data</p>
                <p>• Reference content in your React components using the content service</p>
                <p>• Changes will be reflected on your website immediately</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManager; 