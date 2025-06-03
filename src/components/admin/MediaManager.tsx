import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Trash2, 
  Edit, 
  Eye, 
  Download,
  FolderOpen,
  Plus,
  Star,
  Calendar,
  FileType,
  HardDrive
} from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';
import ImageInput from '@/components/ui/image-input';
import { mediaService } from '@/lib/database-service';
import { supabase } from '@/lib/supabase';
import type { Media } from '@/lib/supabase';

interface MediaItem extends Media {
  // Add any additional properties if needed
}

const MediaManager = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    tags: '',
    featured: false
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    tags: '',
    featured: false,
    url: '',
    type: 'image' as 'image' | 'video'
  });

  // Fetch all media with better error handling
  const { data: mediaItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      console.log('Fetching media data...');
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Media fetch error:', error);
        throw error;
      }
      
      console.log('Media data fetched:', data?.length || 0, 'items');
      return data as MediaItem[];
    },
    staleTime: 10000, // 10 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (urlData: typeof uploadForm) => {
      // Handle URL-based upload (both from FileUpload component and manual URL entry)
      const { data, error } = await supabase
        .from('media')
        .insert([{
          name: urlData.name,
          url: urlData.url,
          type: urlData.type,
          size: 0, // URL entries don't have size info
          description: urlData.description || null,
          tags: urlData.tags ? urlData.tags.split(',').map(t => t.trim()) : [],
          featured: urlData.featured
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({ title: "Success", description: "Media uploaded successfully." });
      setIsUploadDialogOpen(false);
      resetUploadForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await mediaService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({ title: "Success", description: "Media deleted successfully." });
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MediaItem> }) => {
      return await mediaService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({ title: "Success", description: "Media updated successfully." });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Sync mutation to populate media from other tables
  const syncMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting media sync...');
      
      // Force refresh the media query
      queryClient.removeQueries({ queryKey: ['media'] });
      const result = await refetch();
      
      console.log('Sync completed, media count:', result.data?.length || 0);
      return result.data;
    },
    onSuccess: (data) => {
      const count = data?.length || 0;
      toast({ 
        title: "Media Refreshed", 
        description: `Found ${count} media items in your library.`,
      });
    },
    onError: (error) => {
      console.error('Sync error:', error);
      toast({
        title: "Refresh Error", 
        description: "Failed to refresh media. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter media items
  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle file upload from FileUpload component
  const handleFileUpload = (url: string) => {
    // When FileUpload component uploads successfully, it returns the URL
    // We need to create a media record with this URL
    const urlData = {
      name: uploadForm.name || 'Uploaded Media',
      description: uploadForm.description,
      tags: uploadForm.tags,
      featured: uploadForm.featured,
      url: url,
      type: uploadForm.type
    };
    uploadMutation.mutate(urlData);
  };

  // Handle upload errors from FileUpload component
  const handleUploadError = (error: string) => {
    setUploadError(error);
    toast({
      title: "Upload Error",
      description: error,
      variant: "destructive",
    });
  };

  // Handle URL upload
  const handleUrlUpload = () => {
    if (!uploadForm.url || !uploadForm.name) {
      toast({
        title: "Validation Error",
        description: "Please provide both URL and name.",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(uploadForm);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      selectedItems.forEach(id => deleteMutation.mutate(id));
    }
  };

  // Handle edit
  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      featured: item.featured || false
    });
    setIsEditDialogOpen(true);
  };

  // Handle update
  const handleUpdate = () => {
    if (!editingItem) return;

    updateMutation.mutate({
      id: editingItem.id,
      updates: {
        name: editForm.name,
        description: editForm.description || null,
        tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()) : [],
        featured: editForm.featured
      }
    });
  };

  // Reset forms
  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      description: '',
      tags: '',
      featured: false,
      url: '',
      type: 'image'
    });
    setUploadError('');
  };

  // Toggle item selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Force refresh function
  const forceRefresh = async () => {
    console.log('Force refreshing media...');
    queryClient.removeQueries({ queryKey: ['media'] });
    await refetch();
  };

  if (error) {
    console.error('MediaManager error:', error);
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Error Loading Media</h3>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              {error.message || 'Failed to load media items. Please try again.'}
            </p>
            <div className="space-y-2 mb-8">
              <p className="text-xs text-gray-500">Debug info:</p>
              <pre className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded max-w-lg mx-auto overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => forceRefresh()} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Force Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Debug logging
  console.log('MediaManager render:', {
    isLoading,
    error: error?.message,
    mediaCount: mediaItems?.length,
    filteredCount: filteredItems?.length
  });

  return (
    <div className="space-y-6">
      {/* Debug Panel - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-400 text-sm">🔧 Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Query Status:</p>
                <p className="text-white">Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p className="text-white">Error: {error ? 'Yes' : 'No'}</p>
                <p className="text-white">Media Items: {mediaItems?.length || 0}</p>
                <p className="text-white">Filtered Items: {filteredItems?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Filters:</p>
                <p className="text-white">Search: "{searchTerm}"</p>
                <p className="text-white">Type: {filterType}</p>
                <p className="text-white">View: {viewMode}</p>
                <p className="text-white">Selected: {selectedItems.length}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => forceRefresh()} className="bg-orange-600 hover:bg-orange-700">
                Force Refresh
              </Button>
              <Button size="sm" onClick={() => console.log('MediaItems:', mediaItems)} variant="outline">
                Log Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <HardDrive className="w-5 h-5" />
            Media Manager
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Manage all your photos and videos in one place. Upload, organize, and optimize your media assets.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Total Items</span>
              </div>
              <div className="text-2xl font-bold text-white">{mediaItems.length}</div>
              <p className="text-xs text-gray-400">Media files</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Images</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {mediaItems.filter(item => item.type === 'image').length}
              </div>
              <p className="text-xs text-gray-400">Photo files</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Videos</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {mediaItems.filter(item => item.type === 'video').length}
              </div>
              <p className="text-xs text-gray-400">Video files</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Featured</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {mediaItems.filter(item => item.featured).length}
              </div>
              <p className="text-xs text-gray-400">Featured items</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white min-w-[120px]"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedItems.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedItems.length})
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {syncMutation.isPending ? 'Syncing...' : 'Refresh Media'}
              </Button>
              
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <div className="aspect-video bg-gray-700 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-xl mx-auto mb-6 flex items-center justify-center">
                <FolderOpen className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {searchTerm || filterType !== 'all' ? 'No Media Found' : 'No Media Yet'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Upload your first media file to get started with your portfolio.'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Media
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {syncMutation.isPending ? 'Checking...' : 'Check for Existing Media'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
              <div className="relative aspect-video rounded-t-lg overflow-hidden">
                {/* Selection checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Media preview */}
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setPreviewItem(item)}
                      className="bg-blue-600/90 hover:bg-blue-600 text-white border-0 backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleEdit(item)}
                      className="bg-green-600/90 hover:bg-green-600 text-white border-0 backdrop-blur-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600/90 hover:bg-red-600 text-white border-0 backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {item.featured && (
                    <Badge className="bg-yellow-500/90 text-yellow-900 backdrop-blur-sm">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge 
                    className={`backdrop-blur-sm ${
                      item.type === 'image' 
                        ? 'bg-green-500/90 text-green-900' 
                        : 'bg-purple-500/90 text-purple-900'
                    }`}
                  >
                    {item.type === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                    {item.type}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-1 truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-2">
                  {formatFileSize(item.size)} • {new Date(item.created_at).toLocaleDateString()}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-0">
            {/* List header */}
            <div className="flex items-center p-4 border-b border-gray-700 text-sm font-medium text-gray-300">
              <div className="w-8"></div>
              <div className="flex-1">Name</div>
              <div className="w-20">Type</div>
              <div className="w-24">Size</div>
              <div className="w-28">Date</div>
              <div className="w-32">Actions</div>
            </div>

            {/* List items */}
            <div className="divide-y divide-gray-700">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="w-8 mr-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{item.name}</p>
                        {item.featured && (
                          <Star className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="w-20">
                    <Badge 
                      variant="outline"
                      className={item.type === 'image' ? 'text-green-400 border-green-500/30' : 'text-purple-400 border-purple-500/30'}
                    >
                      {item.type}
                    </Badge>
                  </div>

                  <div className="w-24 text-sm text-gray-400">
                    {formatFileSize(item.size)}
                  </div>

                  <div className="w-28 text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>

                  <div className="w-32 flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setPreviewItem(item)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Upload Media</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload photos and videos to your media library. Supports direct upload or URL entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <Label className="text-white font-medium mb-3 block">Upload File</Label>
              <FileUpload
                onUpload={handleFileUpload}
                onError={handleUploadError}
                accept="image/*,video/*"
                maxSize={100} // 100MB
                bucket="media"
                folder="uploads"
                className="bg-gray-700 border-gray-600"
                placeholder="Upload file or drag and drop"
              />
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPEG, PNG, GIF, MP4, MOV, AVI up to 100MB
              </p>
              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            {/* URL Entry */}
            <div className="space-y-4">
              <Label className="text-white font-medium">Enter Media URL</Label>
              
              <ImageInput
                label="Media URL"
                value={uploadForm.url}
                onChange={(url) => setUploadForm(prev => ({ ...prev, url }))}
                placeholder="Enter image/video URL or Google Drive link"
                required={false}
                bucket="media"
                folder=""
                showGoogleDriveHelp={true}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-sm">Name</Label>
                  <Input
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Media name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white text-sm">Type</Label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as 'image' | 'video' }))}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white w-full"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-white text-sm">Description (Optional)</Label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the media"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white text-sm">Tags (Optional)</Label>
                <Input
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="comma, separated, tags"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <Switch
                  checked={uploadForm.featured}
                  onCheckedChange={(checked) => setUploadForm(prev => ({ ...prev, featured: checked }))}
                />
                <div>
                  <Label className="text-white font-medium">Featured Media</Label>
                  <p className="text-sm text-gray-400">Mark as featured to highlight this media</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  resetUploadForm();
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleUrlUpload}
                disabled={!uploadForm.url || !uploadForm.name || uploadMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? 'Uploading...' : 'Add Media'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Edit Media</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update media information and settings.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6">
              {/* Media Preview */}
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-700">
                {editingItem.type === 'image' ? (
                  <img 
                    src={editingItem.url} 
                    alt={editingItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-gray-400" />
                    <p className="ml-4 text-gray-300">{editingItem.name}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-sm">Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white text-sm">Type</Label>
                  <Input
                    value={editingItem.type}
                    disabled
                    className="bg-gray-700 border-gray-600 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white text-sm">Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the media"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white text-sm">Tags</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="comma, separated, tags"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <Switch
                  checked={editForm.featured}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, featured: checked }))}
                />
                <div>
                  <Label className="text-white font-medium">Featured Media</Label>
                  <p className="text-sm text-gray-400">Mark as featured to highlight this media</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Updating...' : 'Update Media'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">{previewItem?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {previewItem?.description || 'Media preview'}
            </DialogDescription>
          </DialogHeader>

          {previewItem && (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-700">
                {previewItem.type === 'image' ? (
                  <img 
                    src={previewItem.url} 
                    alt={previewItem.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    src={previewItem.url} 
                    controls
                    className="w-full h-full"
                    style={{ maxHeight: '70vh' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Media Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <Label className="text-gray-400 text-xs">Type</Label>
                  <p className="text-white font-medium capitalize">{previewItem.type}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Size</Label>
                  <p className="text-white font-medium">{formatFileSize(previewItem.size)}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Created</Label>
                  <p className="text-white font-medium">{new Date(previewItem.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Status</Label>
                  <div className="flex items-center gap-2">
                    {previewItem.featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* URL */}
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <Label className="text-gray-400 text-xs block mb-2">URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={previewItem.url}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-gray-300 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(previewItem.url)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaManager; 