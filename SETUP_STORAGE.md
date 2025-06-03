# 🚀 Supabase Storage Setup for File Uploads

This guide will help you set up Supabase storage buckets for the direct file upload functionality.

## ✅ What You Need

- Supabase project with the database already set up
- Admin access to your Supabase dashboard
- The new upload components are now ready to use

## 🔧 Step 1: Create Storage Buckets

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to Storage > Buckets**
3. **Create the `images` bucket:**
   - Click "New bucket"
   - Name: `images`
   - Public bucket: ✅ **Yes** (for public image access)
   - File size limit: `50MB`
   - Allowed MIME types: `image/*`

### Option B: Using SQL (Advanced)

Run this SQL in your Supabase SQL editor:

```sql
-- Create images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Set up RLS policies for images bucket
CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');
```

## 🔐 Step 2: Configure Row Level Security (RLS)

If you chose Option A, you'll need to set up RLS policies manually:

1. **Go to Storage > Policies**
2. **Create these policies for the `images` bucket:**

### Policy 1: Public Read Access
```sql
CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
```

### Policy 2: Allow Uploads
```sql
CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');
```

### Policy 3: Allow Updates (Optional)
```sql
CREATE POLICY "Users can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');
```

### Policy 4: Allow Deletions (Optional)
```sql
CREATE POLICY "Users can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');
```

## 📁 Step 3: Folder Structure

The upload system will automatically create these folders:

```
images/
├── uploads/          # General uploads
├── gallery/          # Company gallery images
├── thumbnails/       # Custom thumbnails
├── portfolio/        # Portfolio main images
└── portfolio/gallery/ # Portfolio additional photos
```

## 🔧 Step 4: Environment Variables

Make sure your Supabase configuration is properly set in your project:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## ✨ Step 5: Test the Upload System

1. **Go to `/admin` in your application**
2. **Navigate to Companies or Portfolio section**
3. **Try uploading an image using the new upload interface**
4. **Verify the image appears in your Supabase Storage dashboard**

## 🚀 Features Now Available

### ✅ Direct File Upload
- Drag and drop support
- Progress indicators
- File validation (size, type)
- Automatic file naming
- Image previews

### ✅ Dual Input Mode
- **Upload Tab**: Direct file upload to Supabase storage
- **URL Tab**: Traditional URL entry (Google Drive links supported)
- Automatic Google Drive URL conversion
- Real-time image preview

### ✅ Smart Integration
- Works with existing Google Drive workflow
- Maintains backward compatibility
- Enhanced admin interface
- Improved user experience

## 🔍 Troubleshooting

### Upload Fails
- Check RLS policies are correctly set
- Verify bucket exists and is public
- Check file size and type restrictions
- Ensure Supabase keys are correct

### Images Don't Display
- Verify bucket is set to public
- Check the read policy is in place
- Confirm the URL format is correct

### Permission Errors
- Review RLS policies
- Check user authentication
- Verify bucket permissions

## 📈 Next Steps

1. **Test uploads in all forms** (Companies, Portfolio)
2. **Verify image display** on the frontend
3. **Configure backup/cleanup** policies if needed
4. **Monitor storage usage** in Supabase dashboard

## 💡 Pro Tips

- **File naming**: Files are automatically renamed with timestamps to avoid conflicts
- **Optimization**: Consider image compression before upload for better performance
- **Backup**: Google Drive links still work as backup option
- **Management**: Use the Supabase dashboard to manage uploaded files 