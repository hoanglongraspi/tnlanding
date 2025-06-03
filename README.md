# TN Films - Portfolio Management CMS

A modern, professional portfolio website for TN Films with an integrated Content Management System (CMS) built with React, TypeScript, Vite, and Supabase.

## 🎬 Features

### Portfolio Management
- **Personal Projects**: Manage artistic and personal photography/videography work
- **Commercial Work**: Handle corporate videos, brand campaigns, and professional projects  
- **Events**: Organize wedding, conference, and event coverage
- **Media Library**: Upload and manage images and videos with Supabase Storage
- **Publishing Control**: Draft/Published status with featured item highlighting

### CMS Dashboard
- Real-time analytics and statistics
- Intuitive admin interface with dark theme
- Responsive design for all devices
- File upload with validation (images/videos, 50MB max)
- Search and filter functionality

### Technical Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Backend**: Supabase (Database + Storage)
- **State Management**: TanStack Query
- **Authentication**: Simple token-based admin access

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to **Settings > API**
3. Copy your **Project URL** and **Anon Public Key**

### 3. Environment Configuration
Create a `.env.local` file in your project root:
```env
VITE_SUPABASE_URL=your-supabase-project-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 4. Database Setup
1. In Supabase, go to **SQL Editor**
2. Copy and paste the contents of `src/lib/database.sql`
3. Click **Run** to create all tables and sample data

### 5. Storage Setup
1. In Supabase, go to **Storage**
2. Create a new bucket called `media`
3. Make it a **public bucket**

### 6. Start Development
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn/ui components
│   └── admin/              # CMS admin components
│       ├── PortfolioManager.tsx
│       └── MediaLibrary.tsx
├── lib/
│   ├── supabase.ts         # Supabase client configuration
│   ├── database-service.ts # Database operations
│   └── database.sql        # Database schema
├── pages/
│   ├── AdminDashboard.tsx  # Main CMS dashboard
│   └── AdminLogin.tsx      # Admin authentication
└── hooks/                  # Custom React hooks
```

## 🎯 CMS Usage

### Accessing the CMS
1. Navigate to `/admin/login`
2. Use the admin credentials (default: admin/admin123)
3. You'll be redirected to the CMS dashboard

### Managing Portfolio
- **Personal**: Add artistic projects, experimental work, personal photography
- **Commercial**: Manage corporate videos, brand campaigns, product launches
- **Events**: Handle wedding coverage, conferences, corporate events
- **Media**: Upload images and videos, organize media library

### Publishing Content
- Create items as **Draft** for internal review
- Publish items to make them visible on the website
- Mark important items as **Featured** for homepage highlighting
- Add relevant tags for better organization

## 🛠️ Development

### Adding New Portfolio Categories
To add new categories beyond personal/commercial/events:

1. Update the database enum in `database.sql`:
```sql
ALTER TYPE portfolio_category ADD VALUE 'new_category';
```

2. Update TypeScript types in `supabase.ts`:
```typescript
category: 'personal' | 'commercial' | 'events' | 'new_category'
```

3. Add new tab in `AdminDashboard.tsx`:
```typescript
{ id: "new_category", label: "New Category", icon: SomeIcon }
```

### Customizing the Design
- UI components are in `src/components/ui/`
- Styling uses Tailwind CSS with a dark theme
- Color scheme: Gray backgrounds with blue/orange/green accent colors
- Icons from Lucide React

## 🔒 Security

- Row Level Security (RLS) enabled on all Supabase tables
- File upload validation (type and size limits)
- Admin authentication with token-based sessions
- Environment variables for sensitive configuration

## 📊 Database Schema

The CMS uses three main tables:
- **portfolio**: Stores all portfolio items with categories and metadata
- **media**: Manages uploaded files with references to portfolio items
- **page_content**: Basic page content management for website sections

## 🚢 Deployment

### Environment Variables for Production
Set these in your hosting platform:
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-key
```

### Build for Production
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**TN Films CMS** - Professional portfolio management made simple.
