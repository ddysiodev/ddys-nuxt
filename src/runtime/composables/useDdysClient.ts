import { $fetch, useRuntimeConfig } from '#imports';
import { DdysProxyClient } from '../client/proxy-client';

export function useDdysClient() {
  const runtime = useRuntimeConfig();
  const routePrefix = String(runtime.public?.ddys?.routePrefix || '/api/ddys');
  return new DdysProxyClient(routePrefix, $fetch);
}
