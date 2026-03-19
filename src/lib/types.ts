// ==============================
// Content Format Types
// ==============================

export type PostFormat = 'article' | 'short-video' | 'video-embed' | 'audio' | 'audio-playlist' | 'quote' | 'gallery';

/** Base fields shared by all post formats */
export interface PostBase {
  slug: string;
  title: string;
  subtitle?: string;
  format: PostFormat;
  status: 'draft' | 'published';
  date: string; // ISO date
  tags: string[];
  author?: string;
  thumbnail?: string;
}

// --- Format-specific types ---

export interface ArticlePost extends PostBase {
  format: 'article';
  heroImage?: string;
  pattern?: string;
  take: string;
  works: string;
  different: string;
  content?: string; // optional rich HTML
  tools: string[];
  model: string;
  stage: 'idea' | 'building' | 'launched' | 'profitable' | 'active';
  verification: 'unverified' | 'partial' | 'verified' | 'tonys-pick';
  // Quiz matching fields
  needs_tech?: string; // 'no-code' | 'low-code' | 'can-code' | 'developer'
  fits_goal?: string[]; // ['build-asset', 'quick-revenue', 'augment', 'lifestyle', 'learn']
  fits_domain?: string[]; // ['marketing', 'productivity', 'education', 'saas', 'services', 'lifestyle']
}

export interface ShortVideoPost extends PostBase {
  format: 'short-video';
  videoUrl: string;
  posterUrl?: string;
  duration: number; // seconds
  aspectRatio?: '9:16' | '4:5'; // default 9:16
}

export interface VideoEmbedPost extends PostBase {
  format: 'video-embed';
  provider: 'youtube' | 'bunny';
  videoId: string;
  duration?: number;
}

export interface AudioPost extends PostBase {
  format: 'audio';
  audioUrl: string;
  duration: number; // seconds
  coverImage?: string;
}

export interface Track {
  title: string;
  audioUrl: string;
  duration: number;
  artist?: string;
}

export interface AudioPlaylistPost extends PostBase {
  format: 'audio-playlist';
  tracks: Track[];
  coverImage?: string;
}

export interface QuotePost extends PostBase {
  format: 'quote';
  quoteText: string;
  attribution?: string;
  sourceUrl?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface GalleryPost extends PostBase {
  format: 'gallery';
  images: GalleryImage[];
}

/** Union of all post types */
export type Post = ArticlePost | ShortVideoPost | VideoEmbedPost | AudioPost | AudioPlaylistPost | QuotePost | GalleryPost;

// ==============================
// Stream — Social update items
// ==============================

export type StreamType = 'link' | 'post';

export interface StreamItem {
  slug: string;
  type: StreamType;
  title: string;
  date: string;
  status: 'draft' | 'published';
  url?: string;        // external link (for type: 'link')
  source?: string;     // link source name, e.g. "TechCrunch"
  tags: string[];
  body?: string;       // rendered HTML from MDX
}

export interface Tool {
  slug: string;
  title: string;
  category: 'llm' | 'coding' | 'voice' | 'image' | 'automation' | 'no-code' | 'productivity';
  pricing: 'free' | 'freemium' | 'usage-based' | 'subscription';
  url: string;
}


// ==============================
// Jokes — Dad jokes with optional images
// ==============================

export interface Joke {
  slug: string;
  text?: string;
  image?: string;
  date: string;
}

