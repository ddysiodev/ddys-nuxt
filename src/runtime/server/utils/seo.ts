import type { DdysConfigInput } from '../../config';
import type { DdysItem } from '../../types/ddys';
import { itemPoster, itemSummary, itemTitle, itemUrl } from '../../utils/display';
import { createDdysServerClient } from './client';
import { getDdysConfig } from './config';

export interface DdysSitemapOptions {
  config?: DdysConfigInput;
  basePath?: string;
  staticPaths?: string[];
  includeLatest?: boolean;
  latestLimit?: number;
}

export async function createDdysSitemap(options: DdysSitemapOptions = {}) {
  const client = createDdysServerClient(undefined, options.config);
  const config = client.config;
  const basePath = normalizePath(options.basePath ?? '/ddys');
  const now = new Date().toISOString();
  const staticPaths = options.staticPaths ?? [
    basePath,
    joinPath(basePath, 'latest'),
    joinPath(basePath, 'hot'),
    joinPath(basePath, 'movies'),
    joinPath(basePath, 'search'),
    joinPath(basePath, 'calendar'),
    joinPath(basePath, 'collections'),
    joinPath(basePath, 'shares'),
    joinPath(basePath, 'request')
  ];
  const urls = staticPaths.map((path) => sitemapUrl(config.siteBaseUrl, path, now, 'hourly', '0.7'));
  if (options.includeLatest !== false) {
    const latest = await client.latest({ limit: options.latestLimit ?? 24 }).catch(() => []);
    for (const item of asItems(latest)) {
      if (item.slug) urls.push(sitemapUrl(config.siteBaseUrl, joinPath(basePath, `movie/${encodeURIComponent(item.slug)}`), now, 'daily', '0.8'));
    }
  }
  return xml(['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...dedupe(urls), '</urlset>'].join(''));
}

export function createDdysRobotsText(options: { config?: DdysConfigInput; sitemapPath?: string } = {}) {
  const config = getDdysConfig(undefined, options.config);
  const sitemap = new URL(options.sitemapPath ?? '/sitemap.xml', config.siteBaseUrl).toString();
  return ['User-agent: *', 'Allow: /', 'Disallow: /api/ddys/diagnostics', 'Disallow: /api/ddys/revalidate', `Sitemap: ${sitemap}`, `Host: ${config.siteBaseUrl}`].join('\n');
}

export function createDdysManifest(options: { config?: DdysConfigInput; name?: string; shortName?: string; startUrl?: string } = {}) {
  const config = getDdysConfig(undefined, options.config);
  return {
    name: options.name ?? 'DDYS',
    short_name: options.shortName ?? 'DDYS',
    description: 'DDYS API powered movie and video experience.',
    start_url: options.startUrl ?? '/ddys',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      { src: `${config.iconBasePath}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${config.iconBasePath}/icon-512.png`, sizes: '512x512', type: 'image/png' }
    ]
  };
}

export function createDdysMovieJsonLd(movie: DdysItem, configInput: DdysConfigInput = {}) {
  const config = getDdysConfig(undefined, configInput);
  return stripEmpty({
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: itemTitle(movie),
    description: itemSummary(movie),
    image: itemPoster(movie),
    url: itemUrl(movie, config.siteBaseUrl),
    datePublished: movie.year ? String(movie.year) : undefined,
    genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
    countryOfOrigin: Array.isArray(movie.region) ? movie.region.join(', ') : movie.region,
    aggregateRating: movie.rating ? {
      '@type': 'AggregateRating',
      ratingValue: String(movie.rating),
      bestRating: '10'
    } : undefined
  });
}

function sitemapUrl(baseUrl: string, path: string, lastmod: string, changefreq: string, priority: string) {
  const loc = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  return `<url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function asItems(payload: unknown): DdysItem[] {
  if (Array.isArray(payload)) return payload as DdysItem[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) return (payload as { data: DdysItem[] }).data;
  return [];
}

function normalizePath(path: string): string {
  const clean = String(path || '/').trim();
  return clean.startsWith('/') ? clean.replace(/\/+$/, '') || '/' : `/${clean.replace(/\/+$/, '')}`;
}

function joinPath(basePath: string, segment: string): string {
  const base = normalizePath(basePath);
  const cleanSegment = String(segment || '').replace(/^\/+/, '').replace(/\/+$/, '');
  return cleanSegment ? `${base === '/' ? '' : base}/${cleanSegment}` : base;
}

function dedupe(values: string[]) {
  return [...new Set(values)];
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] || char);
}

function xml(value: string) {
  return value;
}

function stripEmpty(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}
