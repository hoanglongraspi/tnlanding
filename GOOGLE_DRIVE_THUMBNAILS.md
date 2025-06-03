# Google Drive Thumbnails for Commercial Work

This CMS now supports Google Drive links for thumbnails in the Commercial Work section. Here's how to set it up:

## ✅ What's New

- **Dynamic Commercial Thumbnail**: The Commercial Work section on the homepage now shows a thumbnail from your CMS
- **Google Drive Support**: You can use Google Drive sharing links for both images and thumbnails
- **Automatic Conversion**: Google Drive links are automatically converted to direct image URLs
- **Featured System**: Mark gallery items as "featured" to highlight them and set homepage thumbnail

## 🔧 How to Set Up Commercial Work Thumbnail

### Step 1: Access Admin Panel
1. Go to `/admin` in your browser
2. Navigate to the "Companies" tab

### Step 2: Create/Edit a Company
1. Click "Add New Company" or edit an existing one
2. Fill in company details (name, description, etc.)

### Step 3: Add Gallery Items
1. Select a company and click "Add Media"
2. For **Media URL**: Paste your Google Drive sharing link or regular image URL
3. For **Thumbnail URL**: (Optional) Paste a Google Drive link for a custom thumbnail
4. Set **Media Type**: Choose "image" or "video"
5. **Check "Featured"**: This item will appear on the homepage Commercial Work section
6. Set **Status** to "Published"

### Step 4: Google Drive Link Format
Your Google Drive sharing links should look like:
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

The system will automatically convert these to:
```
https://drive.google.com/uc?id=FILE_ID
```

## 📸 Supported URL Formats

### Google Drive URLs (Auto-converted)
- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/file/d/FILE_ID/edit`
- `https://drive.google.com/file/d/FILE_ID/preview`

### Regular Image URLs
- Any direct image URL (`.jpg`, `.png`, `.gif`, `.webp`)
- Images hosted on your server (e.g., `/images/photo.jpg`)

## ⭐ Featured Items

- Only **one** gallery item should be marked as "featured" at a time for the homepage thumbnail
- If multiple items are featured, the first one (by sort order) will be used
- If no featured item exists, the system will show the most recent published item
- If no CMS items exist, it falls back to the default hardcoded image

## 🎯 Best Practices

1. **Image Quality**: Use high-resolution images (at least 800x600px)
2. **Aspect Ratio**: Square or landscape images work best for thumbnails
3. **File Size**: Optimize images for web (under 2MB recommended)
4. **Google Drive Permissions**: Make sure your Google Drive files are set to "Anyone with the link can view"
5. **Backup**: Keep local copies of your images in case Google Drive links change

## 🔍 Troubleshooting

### Image Not Loading?
1. Check if the Google Drive file is set to public ("Anyone with the link can view")
2. Verify the file ID in the URL is correct
3. Try the converted URL directly in your browser
4. Check browser console for error messages

### Thumbnail Not Appearing on Homepage?
1. Make sure the gallery item is marked as "featured"
2. Verify the status is set to "published"
3. Clear browser cache and refresh the page
4. Check if there are any console errors

### Google Drive Link Not Working?
1. Copy the sharing link again from Google Drive
2. Make sure you're using the full sharing URL with `/view?usp=sharing`
3. Test the converted URL: replace `/view?usp=sharing` with `/uc?id=FILE_ID` manually

## 📱 Technical Details

The system uses these utility functions:
- `convertGoogleDriveImageUrl()`: Converts sharing links to direct image URLs
- `getThumbnailUrl()`: Chooses between thumbnail_url and media_url with proper conversion
- `companyGalleryService.getFeaturedCommercialThumbnail()`: Fetches the featured item for homepage

## 🎉 Benefits

- **No File Uploads**: Use Google Drive for easy image management
- **Dynamic Content**: Update homepage thumbnail without code changes
- **Professional Workflow**: Manage client content through CMS
- **Fallback System**: Always shows an image even if CMS fails
- **Performance**: Lazy loading and error handling built-in

---

Your CMS now supports Google Drive thumbnails! 🚀 