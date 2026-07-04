export { DdysClient, type DdysFetch, type DdysRequestOptions } from './client';
export { DdysProxyClient, type DdysProxyFetch } from './proxy-client';
export { DdysError } from './error';
export {
  DDYS_NUXT_VERSION,
  DEFAULT_DDYS_CONFIG,
  mergeDdysConfig,
  publicDdysConfig,
  safeDdysConfig,
  type DdysCacheConfig,
  type DdysConfig,
  type DdysConfigInput,
  type DdysDiagnosticsConfig,
  type DdysProxyConfig,
  type DdysRequestFormConfig,
  type DdysSecurityConfig
} from '../config';
export type * from '../types/ddys';
