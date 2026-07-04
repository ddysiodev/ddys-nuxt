import type { DdysQuery } from './types/ddys';
import { boolValue, intRange, normalizeBaseUrl } from './utils/security';

export interface DdysCacheConfig {
  defaultTtl: number;
  dictionaryTtl: number;
  freshTtl: number;
  listTtl: number;
  detailTtl: number;
  communityTtl: number;
}

export interface DdysRequestFormConfig {
  enabled: boolean;
  csrf: boolean;
  honeypotField: string;
  rateLimitSeconds: number;
  tokenTtlSeconds: number;
  secret?: string;
}

export interface DdysProxyConfig {
  enabled: boolean;
  allowRoutes: string[];
}

export interface DdysDiagnosticsConfig {
  enabled: boolean;
}

export interface DdysSecurityConfig {
  maxLimit: number;
  maxPerPage: number;
  maxPage: number;
  allowedResourceProtocols: string[];
}

export interface DdysConfig {
  apiBaseUrl: string;
  siteBaseUrl: string;
  apiKey?: string;
  routePrefix: string;
  iconBasePath: string;
  timeout: number;
  retryTimes: number;
  retrySleep: number;
  userAgent: string;
  cache: DdysCacheConfig;
  proxy: DdysProxyConfig;
  requestForm: DdysRequestFormConfig;
  diagnostics: DdysDiagnosticsConfig;
  security: DdysSecurityConfig;
  revalidateToken?: string;
}

export type DdysConfigInput = Partial<Omit<DdysConfig, 'cache' | 'proxy' | 'requestForm' | 'diagnostics' | 'security'>> & {
  cache?: Partial<DdysCacheConfig>;
  proxy?: Partial<DdysProxyConfig>;
  requestForm?: Partial<DdysRequestFormConfig>;
  diagnostics?: Partial<DdysDiagnosticsConfig>;
  security?: Partial<DdysSecurityConfig>;
};

export const DDYS_NUXT_VERSION = '0.1.1';

export const DEFAULT_DDYS_CONFIG: DdysConfig = {
  apiBaseUrl: 'https://ddys.io/api/v1',
  siteBaseUrl: 'https://ddys.io',
  apiKey: '',
  routePrefix: '/api/ddys',
  iconBasePath: '/ddys-nuxt/images',
  timeout: 12,
  retryTimes: 1,
  retrySleep: 150,
  userAgent: `ddys-nuxt/${DDYS_NUXT_VERSION}`,
  cache: {
    defaultTtl: 300,
    dictionaryTtl: 86400,
    freshTtl: 300,
    listTtl: 600,
    detailTtl: 1800,
    communityTtl: 120
  },
  proxy: {
    enabled: true,
    allowRoutes: [
      'movies', 'latest', 'hot', 'search', 'suggest', 'calendar',
      'movie', 'sources', 'related', 'comments',
      'collections', 'collection', 'shares', 'share',
      'requests', 'activities', 'user', 'types', 'genres', 'regions'
    ]
  },
  requestForm: {
    enabled: false,
    csrf: true,
    honeypotField: 'ddys_website',
    rateLimitSeconds: 60,
    tokenTtlSeconds: 1800
  },
  diagnostics: {
    enabled: false
  },
  security: {
    maxLimit: 50,
    maxPerPage: 50,
    maxPage: 999,
    allowedResourceProtocols: ['http:', 'https:', 'magnet:', 'ed2k:', 'thunder:']
  },
  revalidateToken: ''
};

export function mergeDdysConfig(input: DdysConfigInput = {}): DdysConfig {
  return {
    ...DEFAULT_DDYS_CONFIG,
    ...input,
    apiBaseUrl: normalizeBaseUrl(input.apiBaseUrl, DEFAULT_DDYS_CONFIG.apiBaseUrl),
    siteBaseUrl: normalizeBaseUrl(input.siteBaseUrl, DEFAULT_DDYS_CONFIG.siteBaseUrl),
    routePrefix: normalizeRoutePrefix(input.routePrefix ?? DEFAULT_DDYS_CONFIG.routePrefix),
    iconBasePath: normalizeRoutePrefix(input.iconBasePath ?? DEFAULT_DDYS_CONFIG.iconBasePath),
    cache: { ...DEFAULT_DDYS_CONFIG.cache, ...input.cache },
    proxy: { ...DEFAULT_DDYS_CONFIG.proxy, ...input.proxy },
    requestForm: { ...DEFAULT_DDYS_CONFIG.requestForm, ...input.requestForm },
    diagnostics: { ...DEFAULT_DDYS_CONFIG.diagnostics, ...input.diagnostics },
    security: { ...DEFAULT_DDYS_CONFIG.security, ...input.security }
  };
}

export function configFromEnv(input: DdysConfigInput = {}, env: Record<string, string | undefined> = process.env): DdysConfig {
  const envConfig: DdysConfigInput = {
    apiBaseUrl: env.DDYS_API_BASE_URL,
    siteBaseUrl: env.DDYS_SITE_BASE_URL,
    apiKey: env.DDYS_API_KEY ?? '',
    revalidateToken: env.DDYS_REVALIDATE_TOKEN ?? '',
    timeout: intRange(env.DDYS_TIMEOUT, DEFAULT_DDYS_CONFIG.timeout, 1, 60),
    retryTimes: intRange(env.DDYS_RETRY_TIMES, DEFAULT_DDYS_CONFIG.retryTimes, 0, 5),
    retrySleep: intRange(env.DDYS_RETRY_SLEEP, DEFAULT_DDYS_CONFIG.retrySleep, 0, 3000),
    requestForm: {
      enabled: boolValue(env.DDYS_REQUEST_FORM_ENABLED),
      secret: env.DDYS_FORM_SECRET,
      csrf: env.DDYS_REQUEST_FORM_CSRF === undefined ? true : boolValue(env.DDYS_REQUEST_FORM_CSRF)
    },
    diagnostics: {
      enabled: boolValue(env.DDYS_DIAGNOSTICS_ENABLED)
    }
  };

  return mergeDdysConfig({
    ...envConfig,
    ...input,
    cache: { ...envConfig.cache, ...input.cache },
    proxy: { ...envConfig.proxy, ...input.proxy },
    requestForm: { ...envConfig.requestForm, ...input.requestForm },
    diagnostics: { ...envConfig.diagnostics, ...input.diagnostics },
    security: { ...envConfig.security, ...input.security }
  });
}

export function publicDdysConfig(config: DdysConfig) {
  return {
    siteBaseUrl: config.siteBaseUrl,
    routePrefix: config.routePrefix,
    iconBasePath: config.iconBasePath,
    requestForm: {
      enabled: config.requestForm.enabled,
      honeypotField: config.requestForm.honeypotField
    },
    diagnostics: {
      enabled: config.diagnostics.enabled
    }
  };
}

export function safeDdysConfig(config: DdysConfig) {
  return {
    ...config,
    apiKey: config.apiKey ? 'configured' : 'not configured',
    revalidateToken: config.revalidateToken ? 'configured' : 'not configured',
    requestForm: {
      ...config.requestForm,
      secret: config.requestForm.secret ? 'configured' : 'not configured'
    }
  };
}

export function normalizeRoutePrefix(value: unknown): string {
  const text = String(value || '').trim().replace(/\/+$/, '');
  if (!text) return '';
  return text.startsWith('/') ? text : `/${text}`;
}

export function cleanRuntimeQuery(query: Record<string, unknown>): DdysQuery {
  return Object.fromEntries(Object.entries(query).filter(([key]) => !['route', 'slug', 'id', 'username', 'noCache'].includes(key))) as DdysQuery;
}
