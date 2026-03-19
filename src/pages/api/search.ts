import type { APIRoute } from 'astro';
import { getPosts, getStream } from '../../lib/data';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.toLowerCase();
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!query) {
    return new Response(JSON.stringify({ results: [], total: 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const posts = await getPosts();
  const stream = await getStream();

  const postResults = posts
    .filter(p =>
      p.title.toLowerCase().includes(query) ||
      (p.subtitle?.toLowerCase().includes(query)) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    )
    .slice(0, limit)
    .map(p => ({ type: 'post', slug: p.slug, title: p.title, format: p.format, date: p.date }));

  const streamResults = stream
    .filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.tags.some(t => t.toLowerCase().includes(query))
    )
    .slice(0, limit)
    .map(s => ({ type: 'stream', slug: s.slug, title: s.title, date: s.date }));

  const results = [...postResults, ...streamResults].slice(0, limit);

  return new Response(JSON.stringify({
    results,
    total: results.length,
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
};
