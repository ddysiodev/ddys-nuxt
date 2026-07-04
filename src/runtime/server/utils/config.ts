import { useRuntimeConfig } from '#imports';
import type { H3Event } from 'h3';
import { type DdysConfig, type DdysConfigInput, mergeDdysConfig, safeDdysConfig } from '../../config';

export function getDdysConfig(event?: H3Event, input: DdysConfigInput = {}): DdysConfig {
  const runtime = useRuntimeConfig(event) as Record<string, any>;
  return mergeDdysConfig({
    ...(runtime.ddys ?? {}),
    ...(runtime.public?.ddys ?? {}),
    ...input,
    cache: { ...(runtime.ddys?.cache ?? {}), ...input.cache },
    proxy: { ...(runtime.ddys?.proxy ?? {}), ...input.proxy },
    requestForm: { ...(runtime.ddys?.requestForm ?? {}), ...input.requestForm },
    diagnostics: { ...(runtime.ddys?.diagnostics ?? {}), ...input.diagnostics },
    security: { ...(runtime.ddys?.security ?? {}), ...input.security }
  });
}

export function safeEventConfig(event?: H3Event) {
  return safeDdysConfig(getDdysConfig(event));
}
