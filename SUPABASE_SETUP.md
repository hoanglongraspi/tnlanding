# TN Films CMS - Supabase Setup Guide

## Overview
This guide will help you set up Supabase for your TN Films CMS dashboard. The CMS includes portfolio management, media library, website content management, and company folder management.

## Features Implemented
✅ **Portfolio Management** - CRUD operations for personal, commercial, and event projects  
✅ **Media Library** - File upload/management with Supabase Storage  
✅ **Content Management** - Dynamic website content (hero text, about sections, etc.)  
✅ **Company Folders** - Manage companies/partners with circular folder design  
✅ **Company Galleries** - Individual galleries for each company with images and videos  
✅ **Analytics Dashboard** - Real-time stats and insights  
✅ **Modern UI** - Professional dark theme with responsive design  

## Prerequisites
- Supabase account (free tier is sufficient)
- Node.js and npm/yarn installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: TN Films CMS
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire contents of `src/lib/database.sql`
3. Click **Run** to execute the SQL

This will create:
- `portfolio` table for projects
- `media` table for file management
- `site_content` table for website content
- Proper RLS (Row Level Security) policies
- Sample data to get started

## Step 5: Set Up Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Enter bucket name: `media`
4. Make it **Public bucket** (check the box)
5. Click **Create bucket**

### Configure Bucket Policies
1. Click on your `media` bucket
2. Go to **Policies** tab
3. Add these policies:

**Policy 1: Allow public uploads**
```sql
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
```

**Policy 2: Allow public downloads**  
```sql
CREATE POLICY "Allow public downloads" ON storage.objects FOR SELECT USING (bucket_id = 'media');
```

**Policy 3: Allow public deletes**
```sql
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'media');
```

## Step 6: Test Your Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/admin/login` in your browser
3. Use any credentials to login (authentication is basic for now)
4. Go to `/admin/dashboard`
5. You should see:
   - Dashboard with real data from Supabase
   - Green "Supabase Connected" indicator
   - Working portfolio, media, and content management

## Troubleshooting

### ❌ "Error Loading Data" or "Supabase Connection Failed"
- Check your `.env.local` file has correct values
- Ensure your Supabase project is active (not paused)
- Verify the database tables were created successfully

### ❌ "File Upload Failed"
- Check the `media` storage bucket exists
- Verify bucket policies are set correctly
- Ensure bucket is set to public

### ❌ "Database Error" when adding portfolio items
- Verify the SQL schema was executed completely
- Check if there are any foreign key constraint issues
- Review the Supabase logs in dashboard → Logs

## Admin Authentication (Optional Enhancement)

The current setup uses basic authentication. For production, consider:

1. **Supabase Auth** - Use Supabase's built-in authentication
2. **Role-based Access** - Implement admin roles
3. **Session Management** - Proper login/logout flow

## API Usage in Your Components

The CMS uses these services:

```typescript
import { portfolioService, mediaService, contentService } from '@/lib/database-service'

// Get portfolio items
const items = await portfolioService.getAll('personal')

// Upload media
const media = await mediaService.upload(file)

// Get website content
const content = await contentService.getByKey('hero_title')
```

## Database Schema Reference

### Portfolio Table
- `id` - UUID (auto-generated)
- `title` - Project title
- `description` - Project description
- `category` - 'personal' | 'commercial' | 'events'
- `image_url` - Main project image
- `video_url` - Optional video URL
- `tags` - Array of tags
- `date` - Project date
- `featured` - Boolean for featured projects
- `status` - 'published' | 'draft'

### Media Table
- `id` - UUID (auto-generated)
- `name` - Original filename
- `url` - Public URL from Supabase Storage
- `type` - 'image' | 'video'
- `size` - File size in bytes
- `portfolio_id` - Optional link to portfolio item

### Site Content Table
- `id` - UUID (auto-generated)
- `key` - Unique identifier (e.g., 'hero_title')
- `title` - Human-readable title
- `content` - The actual content
- `type` - 'text' | 'html' | 'json'

## Next Steps

1. **Customize Content** - Add your actual portfolio items and website content
2. **Integrate with Frontend** - Use the content service in your main website pages
3. **Deploy** - Deploy to Vercel/Netlify with your environment variables
4. **Backup** - Set up regular database backups in Supabase

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase dashboard logs
3. Verify all environment variables are set correctly
4. Ensure your Supabase project is on an active plan

---

🎉 **Your TN Films CMS is now ready!** Visit `/admin/dashboard` to start managing your content. 