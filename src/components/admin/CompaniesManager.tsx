import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload,
  Image as ImageIcon,
  Video,
  Eye,
  Star,
  Folder,
  Globe,
  Calendar,
  Palette,
  ChevronUp,
  ChevronDown,
  Info,
  Move3D,
  GripVertical,
  CheckCircle
} from 'lucide-react';
import { companyService, companyGalleryService } from '@/lib/database-service';
import { Company, CompanyGallery } from '@/lib/supabase';
import { convertVideoUrl, isYouTubeUrl, isGoogleDriveUrl, getVideoPlatform } from '@/lib/utils';
import ImageInput from '@/components/ui/image-input';

interface CompaniesManagerProps {
  onClose?: () => void;
}

const CompaniesManager = ({ onClose }: CompaniesManagerProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCreatingGalleryItem, setIsCreatingGalleryItem] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<CompanyGallery | null>(null);
  
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    logo_url: '',
    website: '',
    folder_color: '#FF6B35',
    sort_order: 0,
    status: 'draft' as 'published' | 'draft'
  });

  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    content_mode: 'slideshow' as 'single' | 'slideshow',
    images: [] as string[],
    thumbnail_url: '',
    sort_order: 0,
    featured: false,
    status: 'draft' as 'published' | 'draft'
  });

  // Image management functions for new gallery item
  const addImageToNew = () => {
    setNewGalleryItem(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const updateImageInNew = (index: number, url: string) => {
    setNewGalleryItem(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }));
  };

  const removeImageFromNew = (index: number) => {
    setNewGalleryItem(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Image management functions for editing gallery item
  const addImageToEdit = () => {
    setEditingGalleryItem(prev => prev ? ({
      ...prev,
      images: [...(prev.images || []), ""]
    }) : null);
  };

  const updateImageInEdit = (index: number, url: string) => {
    setEditingGalleryItem(prev => prev ? ({
      ...prev,
      images: (prev.images || []).map((img, i) => i === index ? url : img)
    }) : null);
  };

  const removeImageFromEdit = (index: number) => {
    setEditingGalleryItem(prev => prev ? ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }) : null);
  };

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies-admin'],
    queryFn: () => companyService.getAll(),
  });

  // Fetch gallery for selected company
  const { data: companyGallery = [], isLoading: galleryLoading } = useQuery({
    queryKey: ['company-gallery-admin', selectedCompanyId],
    queryFn: () => selectedCompanyId ? companyGalleryService.getByCompanyId(selectedCompanyId) : Promise.resolve([]),
    enabled: !!selectedCompanyId,
  });

  // Mutations for companies
  const createCompanyMutation = useMutation({
    mutationFn: companyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies-admin'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCreating(false);
      resetNewCompany();
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Company> }) =>
      companyService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies-admin'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setEditingCompany(null);
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies-admin'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      if (selectedCompanyId) {
        setSelectedCompanyId(null);
      }
    },
  });

  // Mutations for gallery items
  const createGalleryMutation = useMutation({
    mutationFn: companyGalleryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-gallery-admin', selectedCompanyId] });
      setIsCreatingGalleryItem(false);
      resetNewGalleryItem();
    },
  });

  const updateGalleryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CompanyGallery> }) =>
      companyGalleryService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-gallery-admin', selectedCompanyId] });
      setEditingGalleryItem(null);
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: companyGalleryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-gallery-admin', selectedCompanyId] });
    },
  });

  const resetNewCompany = () => {
    setNewCompany({
      name: '',
      description: '',
      logo_url: '',
      website: '',
      folder_color: '#FF6B35',
      sort_order: 0,
      status: 'draft'
    });
  };

  const resetNewGalleryItem = () => {
    setNewGalleryItem({
      title: '',
      description: '',
      media_url: '',
      media_type: 'image',
      content_mode: 'slideshow',
      images: [],
      thumbnail_url: '',
      sort_order: 0,
      featured: false,
      status: 'draft'
    });
  };

  const handleCreateCompany = () => {
    if (!newCompany.name.trim()) return;
    createCompanyMutation.mutate(newCompany);
  };

  const handleUpdateCompany = () => {
    if (!editingCompany) return;
    updateCompanyMutation.mutate({
      id: editingCompany.id,
      updates: editingCompany
    });
  };

  const handleCreateGalleryItem = () => {
    if (!selectedCompanyId || !newGalleryItem.title.trim()) return;
    
    // Validation for different modes
    if (newGalleryItem.media_type === 'video' && !newGalleryItem.media_url.trim()) return;
    if (newGalleryItem.media_type === 'image' && newGalleryItem.images.filter(img => img.trim()).length === 0) return;
    
    // Prepare the item to create
    const itemToCreate = { ...newGalleryItem };
    
    // For photo mode, use the first image as the main media_url and filter out empty images
    if (newGalleryItem.media_type === 'image' && newGalleryItem.images.length > 0) {
      itemToCreate.media_url = newGalleryItem.images[0];
      itemToCreate.images = newGalleryItem.images.filter(img => img.trim());
      itemToCreate.content_mode = 'slideshow';
    }
    
    createGalleryMutation.mutate({
      ...itemToCreate,
      company_id: selectedCompanyId
    });
  };

  const handleUpdateGalleryItem = () => {
    if (!editingGalleryItem) return;
    
    // Prepare the update data
    const itemToUpdate = { ...editingGalleryItem };
    
    // For photo mode, ensure first image is set as main media_url and filter empty images
    if (itemToUpdate.media_type === 'image' && itemToUpdate.images && itemToUpdate.images.length > 0) {
      itemToUpdate.media_url = itemToUpdate.images[0];
      itemToUpdate.images = itemToUpdate.images.filter(img => img.trim());
      itemToUpdate.content_mode = 'slideshow';
    }
    
    // Ensure content_mode and images exist for backwards compatibility
    if (!itemToUpdate.content_mode) {
      itemToUpdate.content_mode = itemToUpdate.media_type === 'image' ? 'slideshow' : 'single';
    }
    if (!itemToUpdate.images) {
      itemToUpdate.images = [];
    }
    
    updateGalleryMutation.mutate({
      id: itemToUpdate.id,
      updates: itemToUpdate
    });
  };

  const predefinedColors = [
    '#FF6B35', '#1E40AF', '#059669', '#DC2626', '#7C3AED',
    '#DB2777', '#EA580C', '#0891B2', '#16A34A', '#9333EA'
  ];

  if (companiesError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">Error loading companies</div>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Companies Manager</h2>
            <p className="text-sm text-gray-400">Quản lý các công ty và gallery của từng công ty</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Companies List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Companies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Folder className="w-5 h-5 text-orange-400" />
            <span>Companies ({companies.length})</span>
          </h3>

          {/* Create Company Form */}
          {isCreating && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-orange-400/20">
              <h4 className="text-md font-semibold text-white mb-4">Create New Company</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Company name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Textarea
                  placeholder="Description"
                  value={newCompany.description}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <ImageInput
                    label="Company Logo"
                    value={newCompany.logo_url}
                    onChange={(url) => setNewCompany(prev => ({ ...prev, logo_url: url }))}
                    placeholder="Upload logo or enter URL"
                    required={false}
                    bucket="images"
                    folder="logos"
                    showGoogleDriveHelp={false}
                  />
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Website</label>
                    <Input
                      placeholder="Website URL"
                      value={newCompany.website}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                {/* Color Picker */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Folder Color</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCompany(prev => ({ ...prev, folder_color: color }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newCompany.folder_color === color ? 'border-white scale-110' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={newCompany.folder_color}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, folder_color: e.target.value }))}
                      className="w-16 h-8 bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newCompany.status}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Sort order"
                    value={newCompany.sort_order}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateCompany}
                    disabled={createCompanyMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false);
                      resetNewCompany();
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Companies List */}
          {companiesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/30 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all cursor-pointer ${
                    selectedCompanyId === company.id 
                      ? 'border-orange-400/50 bg-orange-400/10' 
                      : 'border-gray-700/50 hover:border-gray-600/50'
                  }`}
                  onClick={() => setSelectedCompanyId(selectedCompanyId === company.id ? null : company.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: company.folder_color }}
                      >
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          company.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white flex items-center space-x-2">
                          <span>{company.name}</span>
                          <Badge variant={company.status === 'published' ? 'default' : 'secondary'}>
                            {company.status}
                          </Badge>
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCompany(company);
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this company?')) {
                            deleteCompanyMutation.mutate(company.id);
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {selectedCompanyId === company.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Company Gallery */}
        <div className="space-y-4">
          {selectedCompanyId ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-orange-400" />
                  <span>Gallery ({companyGallery.length})</span>
                </h3>
                <Button
                  onClick={() => setIsCreatingGalleryItem(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Media
                </Button>
              </div>

              {/* Create Gallery Item Form */}
              {isCreatingGalleryItem && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-400/20 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">Add Gallery Item</h4>
                        <p className="text-sm text-gray-400">
                          {newGalleryItem.media_type === 'image' ? '📸 Photo Gallery Mode' : '🎥 Video Content Mode'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setIsCreatingGalleryItem(false);
                        resetNewGalleryItem();
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <h5 className="text-white font-medium mb-4 flex items-center space-x-2">
                        <Info className="w-4 h-4 text-green-400" />
                        <span>Basic Information</span>
                      </h5>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">
                            Title <span className="text-red-400">*</span>
                          </label>
                          <Input
                            placeholder="Enter a descriptive title for this gallery item"
                            value={newGalleryItem.title}
                            onChange={(e) => setNewGalleryItem(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white focus:border-blue-400 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Description</label>
                          <Textarea
                            placeholder="Add a description to help viewers understand this content..."
                            value={newGalleryItem.description}
                            onChange={(e) => setNewGalleryItem(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white focus:border-blue-400 transition-colors resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Mode Toggle - Photo vs Video */}
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <h5 className="text-white font-medium mb-4 flex items-center space-x-2">
                        <Palette className="w-4 h-4 text-purple-400" />
                        <span>Content Type</span>
                      </h5>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                newGalleryItem.media_type === 'image' 
                                  ? 'bg-blue-600/20 border-2 border-blue-400/50' 
                                  : 'bg-gray-600/20 border-2 border-gray-600/50'
                              }`}>
                                <ImageIcon className={`w-5 h-5 ${newGalleryItem.media_type === 'image' ? 'text-blue-400' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="text-white font-medium">📸 Photo Gallery</p>
                                <p className="text-xs text-gray-400">Multiple photos with slideshow</p>
                              </div>
                            </div>
                            
                            <div className="mx-4">
                              <Switch
                                checked={newGalleryItem.media_type === 'image'}
                                onCheckedChange={(checked) => {
                                  setNewGalleryItem(prev => ({ 
                                    ...prev, 
                                    media_type: checked ? 'image' : 'video',
                                    content_mode: checked ? 'slideshow' : 'single',
                                    images: checked ? prev.images : []
                                  }))
                                }}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                newGalleryItem.media_type === 'video' 
                                  ? 'bg-red-600/20 border-2 border-red-400/50' 
                                  : 'bg-gray-600/20 border-2 border-gray-600/50'
                              }`}>
                                <Video className={`w-5 h-5 ${newGalleryItem.media_type === 'video' ? 'text-red-400' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="text-white font-medium">🎥 Video Content</p>
                                <p className="text-xs text-gray-400">Single video with embed support</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Media Management */}
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <h5 className="text-white font-medium mb-4 flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-orange-400" />
                        <span>Media Management</span>
                        <span className="text-sm text-gray-400">
                          ({newGalleryItem.media_type === 'image' 
                            ? `${newGalleryItem.images.length} photos` 
                            : 'video content'})
                        </span>
                      </h5>

                      {/* Multiple Images for Picture Mode */}
                      {newGalleryItem.media_type === 'image' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                            <div className="flex items-center space-x-3">
                              <ImageIcon className="w-5 h-5 text-blue-400" />
                              <div>
                                <p className="text-white font-medium">Photo Collection</p>
                                <p className="text-sm text-blue-300">
                                  {newGalleryItem.images.length} photos added
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={addImageToNew}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Photo
                            </Button>
                          </div>
                          
                          {newGalleryItem.images.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-700/20">
                              <div className="w-12 h-12 bg-gray-600/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-500" />
                              </div>
                              <p className="text-gray-400 mb-2">No photos yet</p>
                              <p className="text-sm text-gray-500">Click "Add Photo" to start building your gallery</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {newGalleryItem.images.map((imageUrl, index) => (
                                <div key={index} className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center">
                                        <span className="text-blue-400 font-bold text-xs">{index + 1}</span>
                                      </div>
                                      <span className="text-white font-medium text-sm">Photo #{index + 1}</span>
                                      {index === 0 && (
                                        <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded">Cover</span>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => removeImageFromNew(index)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <ImageInput
                                    label=""
                                    value={imageUrl}
                                    onChange={(url) => updateImageInNew(index, url)}
                                    placeholder={`Upload photo ${index + 1} or enter URL`}
                                    required={false}
                                    bucket="images"
                                    folder="slideshow"
                                    showGoogleDriveHelp={false}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Video URL (for video mode only) */}
                      {newGalleryItem.media_type === 'video' && (
                        <div className="space-y-4">
                          <div className="p-3 bg-red-600/10 rounded-lg border border-red-600/20">
                            <div className="flex items-center space-x-3">
                              <Video className="w-5 h-5 text-red-400" />
                              <div>
                                <p className="text-white font-medium">Video Content</p>
                                <p className="text-sm text-red-300">Add your video URL with platform support</p>
                              </div>
                            </div>
                          </div>
                          
                          <ImageInput
                            label="Video URL"
                            value={newGalleryItem.media_url}
                            onChange={(url) => setNewGalleryItem(prev => ({ ...prev, media_url: url }))}
                            placeholder="Enter video URL (YouTube, Google Drive, or direct link)"
                            required={true}
                            bucket="images"
                            folder="gallery"
                            showGoogleDriveHelp={true}
                          />
                          
                          {/* Platform support feedback */}
                          {newGalleryItem.media_url && (isYouTubeUrl(newGalleryItem.media_url) || isGoogleDriveUrl(newGalleryItem.media_url)) && (
                            <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <div>
                                  <p className="text-green-400 font-medium text-sm">
                                    ✅ {getVideoPlatform(newGalleryItem.media_url).toUpperCase()} URL detected
                                  </p>
                                  <p className="text-xs text-gray-300 mt-1">
                                    Will be converted to: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{convertVideoUrl(newGalleryItem.media_url)}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Custom Thumbnail */}
                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <ImageInput
                          label="Custom Thumbnail (Optional)"
                          value={newGalleryItem.thumbnail_url}
                          onChange={(url) => setNewGalleryItem(prev => ({ ...prev, thumbnail_url: url }))}
                          placeholder="Upload custom thumbnail or leave empty for auto-generation"
                          required={false}
                          bucket="images"
                          folder="thumbnails"
                          showGoogleDriveHelp={false}
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <h5 className="text-white font-medium mb-4 flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>Display Settings</span>
                      </h5>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Publication Status</label>
                          <select
                            value={newGalleryItem.status}
                            onChange={(e) => setNewGalleryItem(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 transition-colors"
                          >
                            <option value="draft">📝 Draft</option>
                            <option value="published">🌐 Published</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Display Order</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newGalleryItem.sort_order}
                            onChange={(e) => setNewGalleryItem(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                            className="bg-gray-700 border-gray-600 text-white focus:border-blue-400 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-600/10 rounded-lg border border-yellow-600/20">
                        <div className="flex items-center space-x-3">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-white font-medium">Featured Item</p>
                            <p className="text-sm text-yellow-300">
                              Mark as featured to highlight this content on homepage
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={newGalleryItem.featured}
                          onCheckedChange={(checked) => setNewGalleryItem(prev => ({ ...prev, featured: checked }))}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        💡 {newGalleryItem.media_type === 'image' 
                          ? 'Photos will display as a slideshow on the website' 
                          : 'Video will be embedded with platform support'}
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            setIsCreatingGalleryItem(false);
                            resetNewGalleryItem();
                          }}
                          variant="ghost"
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateGalleryItem}
                          disabled={
                            createGalleryMutation.isLoading || 
                            !newGalleryItem.title.trim() || 
                            (
                              // For video mode, require media_url
                              (newGalleryItem.media_type === 'video' && !newGalleryItem.media_url.trim()) ||
                              // For photo mode, require at least one image
                              (newGalleryItem.media_type === 'image' && newGalleryItem.images.filter(img => img.trim()).length === 0)
                            )
                          }
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        >
                          {createGalleryMutation.isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Add Media
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Items */}
              {galleryLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-800/30 rounded-xl animate-pulse border border-gray-700/50">
                      <div className="h-full flex flex-col">
                        <div className="flex-1 bg-gray-700/50 rounded-t-xl"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : companyGallery.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-700/30 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Folder className="w-10 h-10 text-gray-500" />
                  </div>
                  <h5 className="text-xl font-semibold text-white mb-3">No gallery items yet</h5>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Start building this company's portfolio by adding photos and videos to showcase their work.
                  </p>
                  <Button
                    onClick={() => setIsCreatingGalleryItem(true)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{companyGallery.length} items total</span>
                    <span>
                      {companyGallery.filter(item => item.status === 'published').length} published, {' '}
                      {companyGallery.filter(item => item.status === 'draft').length} drafts
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2">
                    {companyGallery.map((item) => (
                      <div key={item.id} className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
                        {/* Image Container */}
                        <div className="aspect-video relative overflow-hidden bg-gray-900">
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                          
                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                            <div className="p-4 w-full">
                              <div className="flex items-center justify-center space-x-3">
                                <Button
                                  onClick={() => setEditingGalleryItem({
                                    ...item,
                                    images: item.images || [],
                                    content_mode: item.content_mode || (item.media_type === 'image' ? 'slideshow' : 'single')
                                  })}
                                  size="sm"
                                  className="bg-blue-600/90 hover:bg-blue-600 text-white border-0 backdrop-blur-sm shadow-lg"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${item.title}"?\n\nThis action cannot be undone.`)) {
                                      deleteGalleryMutation.mutate(item.id);
                                    }
                                  }}
                                  size="sm"
                                  className="bg-red-600/90 hover:bg-red-600 text-white border-0 backdrop-blur-sm shadow-lg"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Media Type & Count Indicators */}
                          <div className="absolute top-3 left-3 flex space-x-2">
                            {item.media_type === 'video' ? (
                              <div className="flex items-center space-x-1 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg">
                                <Video className="w-3 h-3" />
                                <span>Video</span>
                              </div>
                            ) : item.images && item.images.length > 1 ? (
                              <div className="flex items-center space-x-1 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg">
                                <ImageIcon className="w-3 h-3" />
                                <span>{item.images.length} Photos</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 bg-gray-600/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg">
                                <ImageIcon className="w-3 h-3" />
                                <span>Photo</span>
                              </div>
                            )}
                          </div>

                          {/* Status & Featured Indicators */}
                          <div className="absolute top-3 right-3 flex space-x-2">
                            {item.featured && (
                              <div className="bg-yellow-500/90 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>Featured</span>
                              </div>
                            )}
                            <Badge 
                              variant={item.status === 'published' ? 'default' : 'secondary'}
                              className={`text-xs font-medium backdrop-blur-sm shadow-lg ${
                                item.status === 'published' 
                                  ? 'bg-green-600/90 text-white hover:bg-green-600/90' 
                                  : 'bg-gray-600/90 text-gray-200 hover:bg-gray-600/90'
                              }`}
                            >
                              {item.status === 'published' ? '🌐 Live' : '📝 Draft'}
                            </Badge>
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h5 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                              {item.title}
                            </h5>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {item.description || 'No description provided'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(item.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Move3D className="w-3 h-3" />
                              <span>#{item.sort_order}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>Select a company to view its gallery</p>
              <p className="text-sm">Click on a company folder to manage its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Company</h3>
            <div className="space-y-4">
              <Input
                placeholder="Company name"
                value={editingCompany.name}
                onChange={(e) => setEditingCompany(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Textarea
                placeholder="Description"
                value={editingCompany.description}
                onChange={(e) => setEditingCompany(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <ImageInput
                  label="Company Logo"
                  value={editingCompany.logo_url || ''}
                  onChange={(url) => setEditingCompany(prev => prev ? ({ ...prev, logo_url: url }) : null)}
                  placeholder="Upload logo or enter URL"
                  required={false}
                  bucket="images"
                  folder="logos"
                  showGoogleDriveHelp={false}
                />
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Website</label>
                  <Input
                    placeholder="Website URL"
                    value={editingCompany.website || ''}
                    onChange={(e) => setEditingCompany(prev => prev ? ({ ...prev, website: e.target.value }) : null)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Folder Color</label>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingCompany(prev => prev ? ({ ...prev, folder_color: color }) : null)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          editingCompany.folder_color === color ? 'border-white scale-110' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={editingCompany.folder_color}
                    onChange={(e) => setEditingCompany(prev => prev ? ({ ...prev, folder_color: e.target.value }) : null)}
                    className="w-16 h-8 bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editingCompany.status}
                  onChange={(e) => setEditingCompany(prev => prev ? ({ ...prev, status: e.target.value as 'published' | 'draft' }) : null)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <Input
                  type="number"
                  placeholder="Sort order"
                  value={editingCompany.sort_order}
                  onChange={(e) => setEditingCompany(prev => prev ? ({ ...prev, sort_order: parseInt(e.target.value) || 0 }) : null)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateCompany}
                  disabled={updateCompanyMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update
                </Button>
                <Button
                  onClick={() => setEditingCompany(null)}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Gallery Item Modal */}
      {editingGalleryItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-0 max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-700">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Edit Gallery Item</h3>
                    <p className="text-sm text-gray-400">
                      {editingGalleryItem.media_type === 'image' ? '📸 Photo Gallery' : '🎥 Video Content'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setEditingGalleryItem(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="p-6 space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Info className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">Basic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm font-medium mb-2 block">
                        Title <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder="Enter a descriptive title for this gallery item"
                        value={editingGalleryItem.title}
                        onChange={(e) => setEditingGalleryItem(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                        className="bg-gray-700 border-gray-600 text-white focus:border-blue-400 transition-colors"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-white text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Add a description to help viewers understand this content..."
                        value={editingGalleryItem.description || ''}
                        onChange={(e) => setEditingGalleryItem(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                        className="bg-gray-700 border-gray-600 text-white focus:border-blue-400 transition-colors resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Content Type Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Palette className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">Content Type</h4>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            editingGalleryItem.media_type === 'image' 
                              ? 'bg-blue-600/20 border-2 border-blue-400/50' 
                              : 'bg-gray-600/20 border-2 border-gray-600/50'
                          }`}>
                            <ImageIcon className={`w-6 h-6 ${editingGalleryItem.media_type === 'image' ? 'text-blue-400' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">📸 Photo Gallery</p>
                            <p className="text-xs text-gray-400">Multiple photos with slideshow</p>
                          </div>
                        </div>
                        
                        <div className="mx-4">
                          <Switch
                            checked={editingGalleryItem.media_type === 'image'}
                            onCheckedChange={(checked) => {
                              setEditingGalleryItem(prev => prev ? ({ 
                                ...prev, 
                                media_type: checked ? 'image' : 'video',
                                content_mode: checked ? 'slideshow' : 'single',
                                images: checked ? (prev.images || []) : []
                              }) : null)
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            editingGalleryItem.media_type === 'video' 
                              ? 'bg-red-600/20 border-2 border-red-400/50' 
                              : 'bg-gray-600/20 border-2 border-gray-600/50'
                          }`}>
                            <Video className={`w-6 h-6 ${editingGalleryItem.media_type === 'video' ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">🎥 Video Content</p>
                            <p className="text-xs text-gray-400">Single video with embed support</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Management Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">Media Management</h4>
                      <p className="text-sm text-gray-400">
                        {editingGalleryItem.media_type === 'image' 
                          ? `Upload and organize multiple photos (${(editingGalleryItem.images || []).length} photos)`
                          : 'Add video content with platform support'}
                      </p>
                    </div>
                  </div>

                  {/* Multiple Images for Picture Mode */}
                  {editingGalleryItem.media_type === 'image' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
                        <div className="flex items-center space-x-3">
                          <ImageIcon className="w-6 h-6 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">Photo Collection</p>
                            <p className="text-sm text-blue-300">
                              {(editingGalleryItem.images || []).length} photos added
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={addImageToEdit}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Photo
                        </Button>
                      </div>
                      
                      {(editingGalleryItem.images || []).length === 0 ? (
                        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-700/20">
                          <div className="w-16 h-16 bg-gray-600/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                          <h5 className="text-white font-semibold mb-2">No photos yet</h5>
                          <p className="text-gray-400 mb-4 max-w-sm mx-auto">
                            Start building your photo gallery by clicking "Add Photo" above
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(editingGalleryItem.images || []).map((imageUrl, index) => (
                            <div key={index} className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-5 hover:bg-gray-700/50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-400 font-bold text-xs">{index + 1}</span>
                                  </div>
                                  <span className="text-white font-medium text-sm">Photo #{index + 1}</span>
                                  {index === 0 && (
                                    <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded">Cover</span>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => removeImageFromEdit(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <ImageInput
                                label=""
                                value={imageUrl}
                                onChange={(url) => updateImageInEdit(index, url)}
                                placeholder={`Upload photo ${index + 1} or enter URL`}
                                required={false}
                                bucket="images"
                                folder="slideshow"
                                showGoogleDriveHelp={false}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Video URL (for video mode only) */}
                  {editingGalleryItem.media_type === 'video' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-red-600/10 rounded-lg border border-red-600/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <Video className="w-6 h-6 text-red-400" />
                          <div>
                            <p className="text-white font-medium">Video Content</p>
                            <p className="text-sm text-red-300">Add your video URL with platform support</p>
                          </div>
                        </div>
                      </div>
                      
                      <ImageInput
                        label="Video URL"
                        value={editingGalleryItem.media_url}
                        onChange={(url) => setEditingGalleryItem(prev => prev ? ({ ...prev, media_url: url }) : null)}
                        placeholder="Enter video URL (YouTube, Google Drive, or direct link)"
                        required={true}
                        bucket="images"
                        folder="gallery"
                        showGoogleDriveHelp={true}
                      />
                      
                      {/* Platform support info */}
                      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Globe className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-blue-400 font-medium text-sm mb-2">🌐 Supported Platforms</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">Y</span>
                                </div>
                                <span><strong>YouTube:</strong> Full embed support</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">G</span>
                                </div>
                                <span><strong>Google Drive:</strong> Auto-conversion</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* URL validation feedback */}
                      {editingGalleryItem.media_url && (isYouTubeUrl(editingGalleryItem.media_url) || isGoogleDriveUrl(editingGalleryItem.media_url)) && (
                        <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-green-400 font-medium text-sm">
                                ✅ {getVideoPlatform(editingGalleryItem.media_url).toUpperCase()} URL detected
                              </p>
                              <p className="text-xs text-gray-300 mt-1">
                                <strong>Converted URL:</strong> <span className="font-mono bg-gray-800 px-2 py-1 rounded">{convertVideoUrl(editingGalleryItem.media_url)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail & Settings Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">Display Settings</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <ImageInput
                        label="Custom Thumbnail (Optional)"
                        value={editingGalleryItem.thumbnail_url || ''}
                        onChange={(url) => setEditingGalleryItem(prev => prev ? ({ ...prev, thumbnail_url: url }) : null)}
                        placeholder="Upload custom thumbnail or leave empty for auto-generation"
                        required={false}
                        bucket="images"
                        folder="thumbnails"
                        showGoogleDriveHelp={false}
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        💡 Leave empty to automatically use the {editingGalleryItem.media_type === 'image' ? 'first photo' : 'video thumbnail'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-yellow-600/10 rounded-lg border border-yellow-600/20">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-white font-medium">Featured Item</p>
                          <p className="text-sm text-yellow-300">
                            {editingGalleryItem.featured 
                              ? '⭐ This item is featured and may appear on the homepage' 
                              : 'Mark as featured to highlight this content'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={editingGalleryItem.featured}
                        onCheckedChange={(checked) => setEditingGalleryItem(prev => prev ? ({ ...prev, featured: checked }) : null)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-800/80 border-t border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <p>Last updated: {new Date(editingGalleryItem.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setEditingGalleryItem(null)}
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateGalleryItem}
                    disabled={
                      updateGalleryMutation.isPending || 
                      !editingGalleryItem.title.trim() ||
                      (editingGalleryItem.media_type === 'video' && !editingGalleryItem.media_url.trim()) ||
                      (editingGalleryItem.media_type === 'image' && (editingGalleryItem.images || []).filter(img => img.trim()).length === 0)
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    {updateGalleryMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesManager; 