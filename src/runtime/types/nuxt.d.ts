import type { DdysProxyClient } from '../client/proxy-client';

declare module '#app' {
  interface NuxtApp {
    $ddys: DdysProxyClient;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ddys: DdysProxyClient;
  }
}

export {};
