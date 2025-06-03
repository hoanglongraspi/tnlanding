import { createClient } from '@supabase/supabase-js'

// Get environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
export const isSupabaseConfigured = () => {
  const hasValidUrl = supabaseUrl && 
                     supabaseUrl !== 'your-supabase-url' && 
                     supabaseUrl.startsWith('https://') &&
                     supabaseUrl.includes('supabase.co')
  
  const hasValidKey = supabaseKey && 
                      supabaseKey !== 'your-supabase-anon-key' &&
                      supabaseKey.length > 50
                      
  return !!(hasValidUrl && hasValidKey)
}

// Create Supabase client with fallback for development
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

// Database types for companies and company galleries
export interface Company {
  id: string
  name: string
  description: string
  logo_url?: string
  industry?: string
  website?: string
  years_of_cooperation?: number
  folder_color: string
  sort_order: number
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}

export interface CompanyGallery {
  id: string
  company_id: string
  title: string
  description?: string
  media_url: string
  media_type: 'image' | 'video'
  content_mode: 'single' | 'slideshow'
  images: string[]
  thumbnail_url?: string
  sort_order: number
  featured: boolean
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}

// Database types for portfolio management
export interface Portfolio {
  id: string
  title: string
  description: string
  category: 'personal' | 'commercial' | 'events'
  image_url: string
  video_url?: string
  images?: string[]
  tags: string[]
  featured: boolean
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  size: number
  description?: string
  tags?: string[]
  featured?: boolean
  portfolio_id?: string
  created_at: string
  updated_at?: string
}

export interface PageContent {
  id: string
  page_name: string
  section: string
  title?: string
  content: string
  type: 'text' | 'html' | 'json'
  updated_at: string
}

// Export configuration status for easy checking
export const getConfigurationStatus = () => {
  return {
    configured: isSupabaseConfigured(),
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlValid: supabaseUrl?.startsWith('https://') && supabaseUrl?.includes('supabase.co'),
    message: isSupabaseConfigured() 
      ? 'Supabase is properly configured' 
      : 'Please configure Supabase credentials in .env.local file'
  }
} 