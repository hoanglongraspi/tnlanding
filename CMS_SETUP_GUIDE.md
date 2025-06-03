# CMS Setup Guide - Quick Start

Your CMS is now ready! Follow these simple steps to get it working:

## 🚀 Quick Setup (5 minutes)

### Step 1: Environment Variables
Create a `.env.local` file in your project root:
```env
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### Step 2: Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing one)
3. Go to **Settings** → **API**
4. Copy **Project URL** and **Anon Public Key**
5. Paste them into your `.env.local` file

### Step 3: Setup Database
1. In Supabase, go to **SQL Editor**
2. Copy the content from `src/lib/database.sql`
3. Paste and click **Run**

### Step 4: Restart Your Dev Server
```bash
npm run dev
```

## 🎯 How to Use Your CMS

### Access Admin Dashboard
1. Go to: `http://localhost:5173/admin`
2. Login with: **admin** / **password**
3. Click on **"Content"** tab

### Manage Landing Page Content
1. Click **"Content"** tab in admin
2. Add content sections like:
   - `hero-title` - Main homepage title
   - `hero-subtitle` - Subtitle text
   - `about-title` - About section heading
   - `about-text` - About section content
   - `services-title` - Services heading
   - `contact-title` - Contact section title

### See CMS in Action
1. Visit: `http://localhost:5173/cms-demo`
2. Edit content in admin dashboard
3. See changes update live on the demo page!

## 📝 Manage Your Portfolio

### Add Portfolio Items
1. Go to admin dashboard
2. Click **"Personal"**, **"Commercial"**, or **"Events"** tabs
3. Click **"Add New Project"**
4. Fill in project details
5. Set as **"Published"** to show on website

### Upload Media
1. Click **"Media"** tab
2. Click **"Upload Files"**
3. Add images/videos (max 50MB each)
4. Copy URLs to use in portfolio items

## 🔧 Integrate CMS with Your Landing Page

To use CMS content in your actual landing page, replace hardcoded text with:

```jsx
import { CMSContent } from "@/components/CMSContent";

// Replace hardcoded text like this:
<h1>Tu Nguyen Film</h1>

// With CMS content like this:
<CMSContent 
  section="hero-title" 
  fallback="Tu Nguyen Film"
  className="text-4xl font-bold"
/>
```

## ✅ Test Everything

1. ✅ Admin login works
2. ✅ Can add/edit portfolio items  
3. ✅ Can upload media files
4. ✅ Can edit page content
5. ✅ Content shows on `/cms-demo` page

## 🆘 Troubleshooting

**"Setup Required" message?**
- Check `.env.local` file exists and has correct values
- Restart dev server after adding environment variables

**Database errors?**
- Make sure you ran the SQL script in Supabase
- Check your Supabase project is active

**404 errors on admin?**
- Make sure you're going to `/admin` not `/admin/dashboard`

---

Your CMS is now fully functional! 🎉 