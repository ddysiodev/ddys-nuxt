import { createError, defineEventHandler } from 'h3';
import { DDYS_NUXT_VERSION } from '../../config';
import { safeEventConfig } from '../utils/config';

export default defineEventHandler((event) => {
  const config = safeEventConfig(event);
  if (!config.diagnostics.enabled) throw createError({ statusCode: 403, statusMessage: 'DDYS diagnostics are disabled.' });
  return {
    success: true,
    data: {
      module: 'ddys-nuxt',
      version: DDYS_NUXT_VERSION,
      runtime: 'nitro',
      config,
      serverRoutes: ['proxy', 'request', 'diagnostics', 'revalidate'],
      components: ['DdysView', 'DdysGrid', 'DdysCard', 'DdysMovieDetail', 'DdysSources', 'DdysSearch', 'DdysRequestForm', 'DdysDiagnostics'],
      composables: ['useDdys', 'useDdysClient', 'useDdysSearch', 'useDdysRequestForm', 'useDdysSeo']
    }
  };
});
