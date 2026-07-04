import { createError, defineEventHandler, getQuery, setHeader } from 'h3';
import type { DdysQuery } from '../../types/ddys';
import { cleanRuntimeQuery } from '../../config';
import { boolValue, scalar } from '../../utils/security';
import { cacheKeyForPath, cachedDdys, tagsForPath, ttlForPath } from '../utils/cache';
import { createDdysServerClient } from '../utils/client';
import { getDdysConfig } from '../utils/config';

export default defineEventHandler(async (event) => {
  const config = getDdysConfig(event);
  if (!config.proxy.enabled) throw createError({ statusCode: 403, statusMessage: 'DDYS proxy is disabled.' });
  const query = getQuery(event) as DdysQuery;
  const route = scalar(query.route, 'latest').toLowerCase();
  const client = createDdysServerClient(event);
  const path = client.resolveProxyPath(route, query);
  if (!path) throw createError({ statusCode: 400, statusMessage: 'Invalid DDYS proxy route parameters.' });

  const clean = cleanRuntimeQuery(query as Record<string, unknown>);
  const ttl = ttlForPath(path, config);
  const tags = tagsForPath(path);
  const key = cacheKeyForPath(path, clean);
  const noCache = boolValue(query.noCache);

  setHeader(event, 'Cache-Control', noCache ? 'no-store' : `public, max-age=${ttl}, stale-while-revalidate=${ttl}`);
  setHeader(event, 'X-DDYS-Tags', tags.join(','));

  try {
    if (noCache) {
      setHeader(event, 'X-DDYS-Cache', 'skip');
      return await client.proxy(route, query, { noCache: true });
    }
    const payload = await cachedDdys(key, ttl, tags, () => client.proxy(route, query));
    setHeader(event, 'X-DDYS-Cache', payload.hit ? 'hit' : 'miss');
    return payload.value;
  } catch (error) {
    throw createError({
      statusCode: typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : 502,
      statusMessage: error instanceof Error ? error.message : 'DDYS proxy request failed.'
    });
  }
});
