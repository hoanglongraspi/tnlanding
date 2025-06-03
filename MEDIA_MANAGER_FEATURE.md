# Media Manager Feature Documentation

## Overview

The **Media Manager** is a comprehensive media management system that replaces the previous "Image Sync" tab. It provides a complete solution for managing all types of media (photos and videos) in your TN Films portfolio website.

## 🚀 Key Features

### 📁 **Universal Media Management**
- **Centralized Library**: Manage all photos and videos in one place
- **Multiple Upload Methods**: Direct file upload or URL entry (including Google Drive links)
- **Dual View Modes**: Grid view for visual browsing, List view for detailed management
- **Smart Search & Filter**: Find media by name, description, or type

### 🎨 **Enhanced Organization**
- **Tagging System**: Add comma-separated tags for better organization
- **Featured Media**: Mark important media as featured
- **Descriptions**: Add detailed descriptions for context
- **Automatic Metadata**: File size, upload date, and type detection

### ⚡ **Advanced Features**
- **Bulk Operations**: Select and delete multiple items at once
- **Live Preview**: Preview images and play videos directly in the interface
- **Edit Mode**: Update media information, tags, and settings
- **Smart Storage**: Automatic file management with Supabase Storage integration

## 🛠️ Technical Implementation

### Architecture
```
MediaManager Component
├── React Query for data fetching
├── Supabase for storage & database
├── Enhanced Media service layer
└── TypeScript for type safety
```

### Database Schema
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('image', 'video')),
    size BIGINT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    portfolio_id UUID REFERENCES portfolio(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Service Layer Enhancement
- **Enhanced Upload**: `mediaService.upload()` with metadata support
- **Smart Updates**: `mediaService.update()` with automatic timestamps
- **Safe Deletion**: `mediaService.delete()` with storage cleanup
- **Error Handling**: Comprehensive error management with user feedback

## 🎯 UI/UX Design

### Design System Compliance
- **Dark Theme**: Full glass-morphism design with backdrop blur effects
- **Category Colors**: Consistent with portfolio categories (blue/orange/green)
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Smooth Animations**: Hover effects and loading states

### Interactive Elements
- **Grid/List Toggle**: Switch between visual and detailed views
- **Multi-Select**: Checkbox selection for bulk operations
- **Preview Modals**: Full-screen media preview with metadata
- **Upload Dialogs**: Intuitive upload interface with progress indicators

## 📱 User Interface

### Main Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Statistics Cards                                      │
│ Total • Images • Videos • Featured                       │
├─────────────────────────────────────────────────────────┤
│ 🔍 Search | 🏷️ Filter | 📋 Grid/List | ➕ Upload        │
├─────────────────────────────────────────────────────────┤
│ 🖼️ Media Grid/List with hover actions                    │
│ • Preview • Edit • Delete                               │
└─────────────────────────────────────────────────────────┘
```

### Upload Dialog
- **File Drop Zone**: Drag & drop support
- **URL Input**: Google Drive link conversion
- **Metadata Form**: Name, description, tags, featured toggle
- **Type Selection**: Image or video classification

### Edit Dialog
- **Live Preview**: Current media display
- **Editable Fields**: Name, description, tags, featured status
- **Validation**: Form validation with error feedback
- **Auto-save**: Changes saved with loading states

## 🔧 Setup & Installation

### 1. Database Migration
Run the migration to add new columns to the media table:
```sql
-- Run media-table-enhancement.sql
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 2. Component Integration
The Media Manager is automatically integrated into the admin dashboard:
- **Tab Name**: "Media Manager" (replaces "Image Sync")
- **Icon**: HardDrive icon for storage representation
- **Route**: `/admin` → Media Manager tab

### 3. Dependencies
All required dependencies are already included:
- `@tanstack/react-query` for data management
- `@supabase/supabase-js` for backend integration
- `lucide-react` for icons
- Shadcn/ui components for consistent design

## 🎮 Usage Guide

### Uploading Media
1. **Click "Upload Media"** button
2. **Choose method**:
   - Drag & drop files into the upload zone
   - Enter URL (supports Google Drive sharing links)
3. **Add metadata** (optional):
   - Name, description, tags
   - Mark as featured
4. **Click "Add Media"** to save

### Managing Media
1. **Search**: Use the search bar to find specific media
2. **Filter**: Select "Images" or "Videos" to filter by type
3. **View Modes**:
   - **Grid**: Visual thumbnails with hover actions
   - **List**: Detailed table with all metadata
4. **Actions**:
   - **Preview**: Click eye icon to view full-size
   - **Edit**: Click edit icon to modify metadata
   - **Delete**: Click trash icon to remove

### Bulk Operations
1. **Select media** using checkboxes
2. **Delete selected** using the bulk delete button
3. **Clear selection** by unchecking items

## 🔗 Integration Points

### Portfolio Integration
- Media can be linked to portfolio items via `portfolio_id`
- Featured media appears in homepage displays
- Tags enable cross-referencing with portfolio categories

### Google Drive Support
- **Automatic Conversion**: Sharing links → direct image URLs
- **Fallback Handling**: Graceful error handling for invalid links
- **Help Text**: Contextual guidance for proper sharing setup

### Storage Management
- **Supabase Storage**: Primary storage for uploaded files
- **URL Support**: External URLs (Google Drive, CDN) supported
- **Cleanup**: Automatic storage cleanup on deletion

## 🚀 Performance Optimizations

### Query Optimization
- **Indexes**: On featured, type, tags, and portfolio_id fields
- **Pagination**: Ready for large media libraries
- **Caching**: React Query with 30-second cache duration

### UX Optimizations
- **Loading States**: Skeleton animations during data fetching
- **Error Boundaries**: Graceful error handling with retry options
- **Optimistic Updates**: Immediate UI feedback for user actions

## 🔧 Developer Notes

### Code Structure
```typescript
MediaManager/
├── State Management (React Query + useState)
├── Form Handling (Upload & Edit forms)
├── UI Components (Grid/List views, Modals)
├── Service Integration (mediaService calls)
└── Error Handling (Toast notifications)
```

### Key Functions
- `handleFileUpload()`: Process file uploads
- `handleUrlUpload()`: Process URL entries
- `handleEdit()`: Manage edit operations
- `handleDelete()`: Safe deletion with confirmation
- `toggleSelection()`: Multi-select functionality

### Styling Patterns
- **Glass-morphism**: `bg-gray-800/50 backdrop-blur-lg`
- **Hover Effects**: `group-hover:scale-105 transition-all duration-300`
- **Category Colors**: Blue for primary, green for success, red for danger
- **Responsive Grid**: `grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

## 🎯 Future Enhancements

### Planned Features
- **Advanced Filters**: Filter by date range, file size, tags
- **Batch Operations**: Bulk edit metadata, batch tagging
- **Import/Export**: CSV export of media metadata
- **Integration**: Direct integration with portfolio creation
- **CDN Support**: Automatic CDN deployment for optimized delivery

### Performance Improvements
- **Virtual Scrolling**: For large media libraries
- **Image Optimization**: Automatic thumbnail generation
- **Lazy Loading**: Progressive image loading
- **Compression**: Automatic image compression on upload

## 📊 Analytics & Insights

The Media Manager provides valuable insights:
- **Total Media Count**: Track your media library growth
- **Type Distribution**: Images vs. videos breakdown
- **Featured Content**: Highlighted media for marketing
- **Storage Usage**: Monitor file sizes and storage consumption

## 🔒 Security & Best Practices

### Security Features
- **Row Level Security**: Supabase RLS policies
- **File Validation**: Type and size validation
- **URL Sanitization**: Safe handling of external URLs
- **Access Control**: Admin-only access through authentication

### Best Practices
- **Consistent Naming**: Use descriptive, consistent file names
- **Regular Cleanup**: Remove unused media periodically
- **Backup Strategy**: Regular database and storage backups
- **Performance Monitoring**: Monitor storage usage and query performance

---

## 🎉 Conclusion

The Media Manager provides a comprehensive, user-friendly solution for managing all media assets in your TN Films portfolio. With its intuitive interface, powerful features, and seamless integration, it significantly improves the content management workflow while maintaining the existing design language and technical architecture.

The system is designed to scale with your needs, providing a solid foundation for future enhancements and growing media libraries. 