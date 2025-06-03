import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  Camera,
  Film,
  Image as ImageIcon,
  Save,
  X,
  Star,
  Info,
  GripVertical,
  Move3D
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioService } from "@/lib/database-service";
import { Portfolio } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { convertVideoUrl, isGoogleDriveUrl, isYouTubeUrl, getVideoPlatform } from "@/lib/utils";
import ImageInput from "@/components/ui/image-input";

interface PortfolioManagerProps {
  category: "personal" | "commercial" | "events";
}

const PortfolioManager = ({ category }: PortfolioManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch portfolio items from Supabase
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['portfolio', category],
    queryFn: () => portfolioService.getAll(category),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: category,
    image_url: "",
    video_url: "",
    featured: false,
    status: "draft" as "published" | "draft",
    images: [] as string[] // New: Support for multiple images
  });

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: portfolioService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast({
        title: "Success",
        description: "Portfolio item created successfully.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Portfolio> }) =>
      portfolioService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast({
        title: "Success",
        description: "Portfolio item updated successfully.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: portfolioService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const getCategoryInfo = () => {
    switch (category) {
      case "personal":
        return { title: "Personal Projects", icon: Camera, color: "blue" };
      case "commercial":
        return { title: "Commercial Work", icon: Film, color: "orange" };
      case "events":
        return { title: "Events", icon: ImageIcon, color: "green" };
    }
  };

  const categoryInfo = getCategoryInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const portfolioData = {
      title: formData.title,
      description: formData.description,
      category: formData.category as "personal" | "commercial" | "events",
      image_url: formData.image_url,
      video_url: formData.video_url || undefined,
      images: formData.images.filter(img => img.trim() !== ''), // Only include non-empty image URLs
      featured: formData.featured,
      status: formData.status
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, updates: portfolioData });
    } else {
      createMutation.mutate(portfolioData);
    }
  };

  const handleEdit = (item: Portfolio) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      featured: item.featured,
      status: item.status,
      images: item.images || [] // Load existing images
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this portfolio item?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: category,
      image_url: "",
      video_url: "",
      featured: false,
      status: "draft",
      images: []
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  // Image management functions
  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const updateImage = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { ...prev, images: newImages };
    });
  };

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-400 mb-6">
              Failed to load portfolio items. Please check your Supabase configuration.
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
          <div className={`w-10 h-10 ${categoryInfo.color === 'blue' ? 'bg-blue-500/20' : categoryInfo.color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'} rounded-xl flex items-center justify-center`}>
            <categoryInfo.icon className={`w-6 h-6 ${categoryInfo.color === 'blue' ? 'text-blue-400' : categoryInfo.color === 'green' ? 'text-green-400' : 'text-orange-400'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{categoryInfo.title}</h2>
            <p className="text-gray-400">
              Enhanced editor with multiple photos support ({items.length} total)
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className={`${categoryInfo.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : categoryInfo.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              onClick={() => setEditingItem(null)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New {category === "events" ? "Event" : "Project"}
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">
                {editingItem ? "Edit" : "Create New"} {categoryInfo.title}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enhanced editor with multiple photos and video support
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="text-white text-sm font-medium">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                      placeholder="Enter a compelling project title"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-white text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white min-h-[120px] mt-2"
                      placeholder="Describe your project in detail..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-white text-sm font-medium">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({...formData, status: value as "published" | "draft"})}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="draft" className="text-white">Draft</SelectItem>
                        <SelectItem value="published" className="text-white">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg">
                      <Switch
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                      />
                      <div>
                        <Label className="text-white font-medium">Featured Project</Label>
                        <p className="text-sm text-gray-400">Mark this project as featured to highlight it</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Management */}
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Media Management</h3>
                  <p className="text-sm text-gray-400">Add multiple photos and one video to showcase your project</p>
                </div>

                {/* Main Thumbnail */}
                <div>
                  <ImageInput
                    label="Main Thumbnail Image"
                    value={formData.image_url}
                    onChange={(url) => setFormData({...formData, image_url: url})}
                    placeholder="Upload thumbnail image or enter URL"
                    required={true}
                    bucket="images"
                    folder="portfolio"
                    showGoogleDriveHelp={true}
                  />
                </div>

                {/* Additional Images */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white text-sm font-medium">Additional Photos</Label>
                    <Button
                      type="button"
                      onClick={addImage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                  </div>
                  
                  {formData.images.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No additional photos yet</p>
                      <p className="text-sm text-gray-500">Click "Add Photo" to start adding more images</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2 text-gray-400">
                              <GripVertical className="w-4 h-4 cursor-move" />
                              <span className="text-sm font-medium">Photo #{index + 1}</span>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeImage(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <ImageInput
                            label=""
                            value={image}
                            onChange={(url) => updateImage(index, url)}
                            placeholder={`Upload photo ${index + 1} or enter URL`}
                            required={false}
                            bucket="images"
                            folder="portfolio/gallery"
                            showGoogleDriveHelp={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video */}
                <div>
                  <Label htmlFor="video_url" className="text-white text-sm font-medium">Video (Optional)</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    placeholder="Enter video URL (YouTube or Google Drive supported)"
                  />
                  
                  {/* Help text for video URLs */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2 text-xs text-gray-400 p-3 bg-gray-700/20 rounded-lg">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                      <div>
                        <p className="font-medium text-blue-400 mb-2">Supported video platforms:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li><strong>YouTube:</strong> https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID</li>
                          <li><strong>Google Drive:</strong> https://drive.google.com/file/d/FILE_ID/view?usp=sharing</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Show converted URL preview for video links */}
                    {formData.video_url && (isYouTubeUrl(formData.video_url) || isGoogleDriveUrl(formData.video_url)) && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-sm text-blue-400 font-medium mb-2">
                          ✅ {getVideoPlatform(formData.video_url).toUpperCase()} URL detected
                        </p>
                        <p className="text-xs text-gray-300">
                          Will be converted to: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{convertVideoUrl(formData.video_url)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
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
                  className={`${categoryInfo.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : categoryInfo.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <div className="aspect-video bg-gray-700 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-16">
            <div className="text-center">
              <div className={`w-20 h-20 ${categoryInfo.color === 'blue' ? 'bg-blue-500/20' : categoryInfo.color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'} rounded-xl mx-auto mb-6 flex items-center justify-center`}>
                <categoryInfo.icon className={`w-10 h-10 ${categoryInfo.color === 'blue' ? 'text-blue-400' : categoryInfo.color === 'green' ? 'text-green-400' : 'text-orange-400'}`} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No {categoryInfo.title} Yet</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Start building your portfolio by creating your first {category} project with our enhanced editor.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className={`${categoryInfo.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : categoryInfo.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group hover:scale-105">
              <div className="relative aspect-video rounded-t-lg overflow-hidden">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=240&fit=crop&crop=center`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                
                {/* Enhanced Overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="bg-blue-600/90 hover:bg-blue-600 text-white border-0 backdrop-blur-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500/90 hover:bg-red-500 text-white backdrop-blur-sm"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Enhanced Status and Featured badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.featured && (
                    <span className="px-3 py-1 bg-yellow-500/90 text-yellow-900 text-xs rounded-full flex items-center gap-1 font-medium backdrop-blur-sm">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  <span className={`px-3 py-1 text-xs rounded-full font-medium backdrop-blur-sm ${
                    item.status === 'published' 
                      ? 'bg-green-500/90 text-green-900' 
                      : 'bg-gray-500/90 text-gray-100'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Media indicators */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {item.video_url && (
                    <div className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Film className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    {item.video_url && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Film className="w-3 h-3" />
                        <span>Video</span>
                      </div>
                    )}
                    {item.images && item.images.length > 0 && (
                      <div className="flex items-center gap-1 text-green-400">
                        <ImageIcon className="w-3 h-3" />
                        <span>{item.images.length} photos</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioManager; 