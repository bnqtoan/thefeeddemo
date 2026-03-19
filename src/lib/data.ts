import { getCollection } from 'astro:content';
import { marked } from 'marked';
import type { Post, ArticlePost, ShortVideoPost, VideoEmbedPost, AudioPost, AudioPlaylistPost, QuotePost, GalleryPost, Tool, StreamItem, Joke } from './types';

// ==============================
// Posts — from Content Collections
// ==============================

/**
 * Spread out consecutive posts of the same format (e.g., quotes).
 * Moves duplicate formats further down the list while preserving relative order.
 */
function spreadConsecutiveFormats(posts: Post[]): Post[] {
  if (posts.length < 3) return posts;

  const result: Post[] = [];
  const deferred: Post[] = [];

  for (const post of posts) {
    const lastFormat = result.length > 0 ? result[result.length - 1].format : null;

    if (lastFormat === post.format && ['quote', 'gallery'].includes(post.format)) {
      // Same format as previous, defer it
      deferred.push(post);
    } else {
      result.push(post);
      // Try to insert a deferred post if it won't create consecutive same format
      if (deferred.length > 0) {
        const idx = deferred.findIndex(d => d.format !== post.format);
        if (idx !== -1) {
          result.push(deferred.splice(idx, 1)[0]);
        }
      }
    }
  }

  // Append remaining deferred posts at the end
  return [...result, ...deferred];
}

export async function getPosts(format?: string): Promise<Post[]> {
  const entries = await getCollection('posts', (entry) => entry.data.status === 'published');
  let posts: Post[] = entries.map(entry => {
    const d = entry.data;
    const base = {
      slug: entry.id.replace(/\.mdx?$/, ''),
      title: d.title,
      subtitle: d.subtitle,
      format: d.format,
      status: d.status,
      date: d.date,
      tags: d.tags || [],
      author: d.author,
      thumbnail: d.thumbnail,
    };
    switch (d.format) {
      case 'article':
        return {
          ...base,
          format: 'article' as const,
          heroImage: d.heroImage,
          pattern: d.pattern,
          take: d.take || '',
          works: d.works || '',
          different: d.different || '',
          content: d.content,
          tools: d.tools || [],
          model: d.model || '',
          stage: d.stage || 'idea',
          verification: d.verification || 'unverified',
          needs_tech: d.needs_tech,
          fits_goal: d.fits_goal,
          fits_domain: d.fits_domain,
        } as ArticlePost;
      case 'short-video':
        return {
          ...base,
          format: 'short-video' as const,
          videoUrl: d.videoUrl || '',
          posterUrl: d.posterUrl,
          duration: d.duration || 0,
          aspectRatio: d.aspectRatio,
        } as ShortVideoPost;
      case 'video-embed':
        return {
          ...base,
          format: 'video-embed' as const,
          provider: d.provider || 'youtube',
          videoId: d.videoId || '',
          duration: d.duration,
        } as VideoEmbedPost;
      case 'audio':
        return {
          ...base,
          format: 'audio' as const,
          audioUrl: d.audioUrl || '',
          duration: d.duration || 0,
          coverImage: d.coverImage,
        } as AudioPost;
      case 'audio-playlist':
        return {
          ...base,
          format: 'audio-playlist' as const,
          tracks: d.tracks || [],
          coverImage: d.coverImage,
        } as AudioPlaylistPost;
      case 'quote':
        return {
          ...base,
          format: 'quote' as const,
          quoteText: d.quoteText || '',
          attribution: d.attribution,
          sourceUrl: d.sourceUrl,
        } as QuotePost;
      case 'gallery':
        return {
          ...base,
          format: 'gallery' as const,
          images: d.images || [],
        } as GalleryPost;
      default:
        return base as Post;
    }
  });
  if (format && format !== 'all') {
    posts = posts.filter(p => p.format === format);
  }
  // Sort by date, then spread out consecutive same-format posts
  posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return format ? posts : spreadConsecutiveFormats(posts);
}

export async function getPostsPaginated(
  page: number = 1,
  perPage: number = 10,
  format?: string,
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ posts: Post[]; hasMore: boolean }> {
  let all = await getPosts(format);

  // Sort by date
  if (sort === 'oldest') {
    all = [...all].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  // 'newest' is already the default order from getPosts

  const start = (page - 1) * perPage;
  const posts = all.slice(start, start + perPage);
  return { posts, hasMore: start + perPage < all.length };
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return all.find(p => p.slug === slug);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const all = await getPosts();
  return all.filter(p => p.tags.includes(tag));
}

// ==============================
// Articles (legacy: "cases")
// ==============================

export async function getCases(): Promise<ArticlePost[]> {
  return (await getPosts('article')) as ArticlePost[];
}

export async function getCase(slug: string): Promise<ArticlePost | undefined> {
  const post = await getPost(slug);
  return post?.format === 'article' ? post as ArticlePost : undefined;
}

// ==============================
// Tools — from Content Collections (data)
// ==============================

export async function getTools(): Promise<Tool[]> {
  const entries = await getCollection('tools');
  return entries.map(e => ({ slug: e.id.replace(/\.json$/, ''), ...e.data }));
}

export async function getTool(slug: string): Promise<Tool | undefined> {
  const tools = await getTools();
  return tools.find(t => t.slug === slug);
}

// ==============================
// Stream — Social update items
// ==============================

export async function getStream(type?: string): Promise<StreamItem[]> {
  const entries = await getCollection('stream', (entry) => entry.data.status === 'published');
  let items: StreamItem[] = await Promise.all(entries.map(async (entry) => {
    const d = entry.data;
    let body: string | undefined;
    if (entry.body && entry.body.trim()) {
      // Use marked to parse markdown body into full HTML
      body = await marked.parse(entry.body.trim());
    }
    return {
      slug: entry.id.replace(/\.mdx?$/, ''),
      type: d.type,
      title: d.title,
      date: d.date,
      status: d.status,
      url: d.url,
      source: d.source,
      tags: d.tags || [],
      body,
    } as StreamItem;
  }));
  if (type && type !== 'all') {
    items = items.filter(i => i.type === type);
  }
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getStreamPaginated(page: number = 1, perPage: number = 10, type?: string): Promise<{ items: StreamItem[]; hasMore: boolean }> {
  const all = await getStream(type);
  const start = (page - 1) * perPage;
  const items = all.slice(start, start + perPage);
  return { items, hasMore: start + perPage < all.length };
}

export async function getStreamItem(slug: string): Promise<StreamItem | undefined> {
  const all = await getStream();
  return all.find(i => i.slug === slug);
}

// ==============================
// Jokes — Dad jokes with optional images
// ==============================

export async function getJokes(): Promise<Joke[]> {
  const entries = await getCollection('jokes');
  return entries
    .map(e => ({ slug: e.id.replace(/\.md$/, ''), ...e.data } as Joke))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getJoke(slug: string): Promise<Joke | undefined> {
  const all = await getJokes();
  return all.find(j => j.slug === slug);
}

