# Synced Images Folder

This folder contains images automatically downloaded from Google Drive for reliable display in your website.

## How It Works

1. **Go to Admin Panel** → `/admin` → **Image Sync** tab
2. **Click "Sync All Images"** to download all Google Drive images
3. **Save downloaded files** to this folder with the suggested filenames
4. **Database is automatically updated** to use local image paths

## File Naming Convention

Files are named using this pattern:
```
{clean-title}-{google-drive-file-id}.jpg
```

Example:
- Original title: "HUNG LOC PHAT TVC"
- Google Drive ID: "1z27b9o9cF0FH9BquVSdagqQ-4JZlepxP"
- Filename: `hung-loc-phat-tvc-1z27b9o9cF0FH9BquVSdagqQ-4JZlepxP.jpg`

## Instructions

1. Use the **Image Sync Manager** in admin panel
2. Click **"Sync All Images"** or sync individual images
3. Your browser will download the images automatically
4. **Save each image** to this folder with the exact filename shown in the console
5. Refresh your website to see the local images

## Benefits

✅ **Reliable Display**: No more broken Google Drive links  
✅ **Fast Loading**: Images served directly from your website  
✅ **No Permissions Issues**: No need to worry about Google Drive sharing settings  
✅ **SEO Friendly**: Better for search engine optimization  

## Production Note

In production, images are automatically uploaded to Supabase Storage instead of requiring manual file placement. 