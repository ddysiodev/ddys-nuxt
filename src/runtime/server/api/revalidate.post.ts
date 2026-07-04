import { createError, defineEventHandler, getHeader, getQuery, readBody } from 'h3';
import { revalidateDdysCache } from '../utils/cache';
import { getDdysConfig } from '../utils/config';

export default defineEventHandler(async (event) => {
  const config = getDdysConfig(event);
  const expected = config.revalidateToken || '';
  const query = getQuery(event);
  const body = await readBody<Record<string, unknown>>(event).catch(() => ({} as Record<string, unknown>));
  const given = getHeader(event, 'x-ddys-revalidate-token') || String(query.token || '') || String(body.token || '');
  if (!expected || given !== expected) throw createError({ statusCode: 403, statusMessage: 'Invalid revalidation token.' });

  const tag = typeof body.tag === 'string' ? body.tag : undefined;
  const path = typeof body.path === 'string' ? body.path : undefined;
  const key = typeof body.key === 'string' ? body.key : undefined;
  if (!tag && !path && !key) throw createError({ statusCode: 422, statusMessage: 'Missing tag, path, or key.' });
  const count = revalidateDdysCache({ tag, path, key });
  return { success: true, data: { tag, path, key, purged: count } };
});
