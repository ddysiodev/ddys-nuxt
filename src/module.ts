import { addComponentsDir, addImportsDir, addPlugin, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit';
import { DEFAULT_DDYS_CONFIG, type DdysConfigInput, configFromEnv, normalizeRoutePrefix, publicDdysConfig } from './runtime/config';

export interface ModuleOptions extends DdysConfigInput {
  globalComponents?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'ddys-nuxt',
    configKey: 'ddys',
    compatibility: {
      nuxt: '>=3.12.0 || >=4.0.0'
    }
  },
  defaults: {
    routePrefix: DEFAULT_DDYS_CONFIG.routePrefix,
    iconBasePath: DEFAULT_DDYS_CONFIG.iconBasePath,
    globalComponents: true
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const resolved = configFromEnv(options);
    const routePrefix = normalizeRoutePrefix(resolved.routePrefix || DEFAULT_DDYS_CONFIG.routePrefix);
    resolved.routePrefix = routePrefix;

    nuxt.options.runtimeConfig.ddys = {
      ...(nuxt.options.runtimeConfig.ddys as Record<string, unknown> | undefined),
      ...resolved
    };
    nuxt.options.runtimeConfig.public.ddys = {
      ...(nuxt.options.runtimeConfig.public.ddys as Record<string, unknown> | undefined),
      ...publicDdysConfig(resolved)
    };

    nuxt.options.css ||= [];
    nuxt.options.css.push(resolver.resolve('runtime/styles/ddys.css'));

    const nuxtOptions = nuxt.options as typeof nuxt.options & {
      nitro?: { publicAssets?: Array<Record<string, unknown>> };
      routeRules?: Record<string, Record<string, unknown>>;
    };
    nuxtOptions.nitro ||= {};
    nuxtOptions.nitro.publicAssets ||= [];
    nuxtOptions.nitro.publicAssets.push({
      dir: resolver.resolve('../public'),
      baseURL: '/ddys-nuxt',
      maxAge: 60 * 60 * 24 * 365
    });

    addImportsDir(resolver.resolve('runtime/composables'));
    addComponentsDir({
      path: resolver.resolve('runtime/components'),
      pathPrefix: false,
      global: options.globalComponents !== false
    });
    addPlugin(resolver.resolve('runtime/plugin'));

    addServerHandler({ route: `${routePrefix}/proxy`, method: 'get', handler: resolver.resolve('runtime/server/api/proxy.get') });
    addServerHandler({ route: `${routePrefix}/request`, method: 'get', handler: resolver.resolve('runtime/server/api/request.get') });
    addServerHandler({ route: `${routePrefix}/request`, method: 'post', handler: resolver.resolve('runtime/server/api/request.post') });
    addServerHandler({ route: `${routePrefix}/diagnostics`, method: 'get', handler: resolver.resolve('runtime/server/api/diagnostics.get') });
    addServerHandler({ route: `${routePrefix}/diagnostics`, method: 'post', handler: resolver.resolve('runtime/server/api/diagnostics.post') });
    addServerHandler({ route: `${routePrefix}/revalidate`, method: 'post', handler: resolver.resolve('runtime/server/api/revalidate.post') });

    nuxtOptions.routeRules ||= {};
    nuxtOptions.routeRules[`${routePrefix}/proxy`] = {
      swr: resolved.cache.defaultTtl,
      headers: { 'x-ddys-nuxt': 'proxy' },
      ...(nuxtOptions.routeRules[`${routePrefix}/proxy`] || {})
    };
  }
});
