import { createError, defineEventHandler } from 'h3';
import { createDdysServerClient } from '../utils/client';
import { getDdysConfig } from '../utils/config';

export default defineEventHandler(async (event) => {
  const config = getDdysConfig(event);
  if (!config.diagnostics.enabled) throw createError({ statusCode: 403, statusMessage: 'DDYS diagnostics are disabled.' });
  try {
    const payload = await createDdysServerClient(event).get('/latest', { limit: 1 }, { noCache: true });
    return { success: true, data: { ok: true, sample: payload } };
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: error instanceof Error ? error.message : 'DDYS diagnostics test failed.'
    });
  }
});
