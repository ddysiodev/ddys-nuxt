import type { DdysConfig } from '../../config';

interface CacheItem {
  expiresAt: number;
  tags: string[];
  value: unknown;
}

const memoryCache = new Map<string, CacheItem>();

export function ttlForPath(path: string, config: DdysConfig): number {
  if (/^\/(types|genres|regions|calendar)$/.test(path)) return config.cache.dictionaryTtl;
  if (/^\/(latest|hot)$/.test(path)) return config.cache.freshTtl;
  if (/^\/(movies\/[^/]+|movies\/[^/]+\/sources|movies\/[^/]+\/related|collections\/[^/]+|shares\/[0-9]+)$/.test(path)) return config.cache.detailTtl;
  if (/^\/(movies\/[^/]+\/comments|suggest|shares|requests|activities|user\/)/.test(path)) return config.cache.communityTtl;
  if (/^\/(movies|search|collections)/.test(path)) return config.cache.listTtl;
  return config.cache.defaultTtl;
}

export function tagsForPath(path: string): string[] {
  const tags = ['ddys'];
  if (/^\/latest/.test(path)) tags.push('ddys:latest');
  if (/^\/hot/.test(path)) tags.push('ddys:hot');
  if (/^\/movies$/.test(path)) tags.push('ddys:movies');
  if (/^\/movies\/([^/]+)/.test(path)) tags.push(`ddys:movie:${path.split('/')[2]}`);
  if (/^\/(types|genres|regions|calendar)$/.test(path)) tags.push('ddys:dictionary');
  if (/^\/(shares|requests|activities|user\/|movies\/[^/]+\/comments)/.test(path)) tags.push('ddys:community');
  return tags;
}

export function cacheKeyForPath(path: string, query: Record<string, unknown> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query).sort(([a], [b]) => a.localeCompare(b))) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  return `ddys:${path}:${params.toString()}`;
}

export async function cachedDdys<T>(key: string, ttl: number, tags: string[], factory: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  const now = Date.now();
  const item = memoryCache.get(key);
  if (item && item.expiresAt > now) return { value: item.value as T, hit: true };
  const value = await factory();
  memoryCache.set(key, { value, tags, expiresAt: now + ttl * 1000 });
  return { value, hit: false };
}

export function revalidateDdysCache(input: { key?: string; tag?: string; path?: string }) {
  let count = 0;
  for (const [key, item] of memoryCache.entries()) {
    const match = (input.key && key === input.key) || (input.path && key.includes(input.path)) || (input.tag && item.tags.includes(input.tag));
    if (match) {
      memoryCache.delete(key);
      count++;
    }
  }
  return count;
}
