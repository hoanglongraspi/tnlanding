import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts video URLs to embeddable format
 * Supports YouTube and Google Drive URLs
 */
export function convertVideoUrl(url: string): string {
  if (!url) return url;

  // Check if it's a YouTube URL
  if (isYouTubeUrl(url)) {
    return convertYouTubeUrl(url);
  }

  // Check if it's a Google Drive URL
  if (isGoogleDriveUrl(url)) {
    return convertGoogleDriveUrl(url);
  }

  // Return original URL if no conversion needed
  return url;
}

/**
 * Converts YouTube URLs to embed format
 * Handles various YouTube URL formats
 */
export function convertYouTubeUrl(url: string): string {
  if (!url) return url;

  // If it's already an embed URL, return as-is
  if (url.includes('/embed/')) {
    return url;
  }

  // YouTube URL patterns to match
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    // https://youtu.be/VIDEO_ID
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    // https://www.youtube.com/embed/VIDEO_ID (already embed format)
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    // https://m.youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  ];

  // Try each pattern to extract the video ID
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // If no pattern matches, return the original URL
  return url;
}

/**
 * Converts Google Drive sharing links to embed format for video display
 * Handles various Google Drive URL formats and converts them to preview URLs
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;

  // If it's already a preview URL, return as-is
  if (url.includes('/preview')) {
    return url;
  }

  // Regular expressions to match different Google Drive URL formats
  const patterns = [
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    // https://drive.google.com/open?id=FILE_ID
    /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/file/d/FILE_ID/edit
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/edit/,
    // https://drive.google.com/file/d/FILE_ID (without additional parameters)
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  ];

  // Try each pattern to extract the file ID
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // If no pattern matches, return the original URL
  return url;
}

/**
 * Checks if a URL is a YouTube link
 */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

/**
 * Checks if a URL is a Google Drive link
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Determines the video platform from URL
 */
export function getVideoPlatform(url: string): 'youtube' | 'googledrive' | 'other' {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isGoogleDriveUrl(url)) return 'googledrive';
  return 'other';
}

/**
 * Validates if a Google Drive URL is in the correct embed format
 */
export function isValidGoogleDriveEmbedUrl(url: string): boolean {
  return isGoogleDriveUrl(url) && url.includes('/preview');
}

/**
 * Validates if a YouTube URL is in the correct embed format
 */
export function isValidYouTubeEmbedUrl(url: string): boolean {
  return isYouTubeUrl(url) && url.includes('/embed/');
}

/**
 * Gets video thumbnail URL
 */
export function getVideoThumbnail(url: string): string | null {
  if (isYouTubeUrl(url)) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  // Google Drive doesn't provide direct thumbnail URLs
  // Could implement a fallback or placeholder
  return null;
}

/**
 * Extracts YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts Google Drive URLs to direct image URLs for thumbnails
 * This is different from video preview URLs - this is for actual image display
 */
export function convertGoogleDriveImageUrl(url: string): string {
  if (!url) return url;

  // If it's already a direct image URL, return as-is
  if (url.includes('drive.google.com/uc?id=') || 
      url.includes('drive.google.com/thumbnail?id=') ||
      url.includes('googleusercontent.com')) {
    return url;
  }

  // Regular expressions to match different Google Drive URL formats
  const patterns = [
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    // https://drive.google.com/open?id=FILE_ID
    /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/file/d/FILE_ID/edit
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/edit/,
    // https://drive.google.com/file/d/FILE_ID (without additional parameters)
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/,
    // https://drive.google.com/file/d/FILE_ID/preview
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/preview/
  ];

  // Try each pattern to extract the file ID
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const fileId = match[1];
      // Try the more reliable thumbnail format first
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    }
  }

  // If no pattern matches, return the original URL
  console.warn('Could not convert Google Drive URL:', url);
  return url;
}

/**
 * Gets the appropriate thumbnail URL for display
 * Handles Google Drive images, regular images, and provides fallbacks
 */
export function getThumbnailUrl(mediaUrl: string, thumbnailUrl?: string): string {
  // If thumbnail URL is provided, use it (and convert if it's Google Drive)
  if (thumbnailUrl) {
    return isGoogleDriveUrl(thumbnailUrl) ? convertGoogleDriveImageUrl(thumbnailUrl) : thumbnailUrl;
  }

  // If media URL is an image and it's Google Drive, convert it for direct display
  if (isGoogleDriveUrl(mediaUrl)) {
    return convertGoogleDriveImageUrl(mediaUrl);
  }

  // For regular image URLs, return as-is
  return mediaUrl;
}
