import { defineNuxtPlugin } from '#app';
import { $fetch, useRuntimeConfig } from '#imports';
import { DdysProxyClient } from './client/proxy-client';

export default defineNuxtPlugin(() => {
  const runtime = useRuntimeConfig();
  const routePrefix = String(runtime.public?.ddys?.routePrefix || '/api/ddys');
  return {
    provide: {
      ddys: new DdysProxyClient(routePrefix, $fetch)
    }
  };
});
