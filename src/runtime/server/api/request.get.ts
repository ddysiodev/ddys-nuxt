import { defineEventHandler, getHeader } from 'h3';
import { createRequestFormToken } from '../utils/request-service';
import { getDdysConfig } from '../utils/config';

export default defineEventHandler(async (event) => {
  const config = getDdysConfig(event);
  const identity = identityFromEvent(event);
  return {
    success: true,
    data: {
      enabled: config.requestForm.enabled,
      token: await createRequestFormToken(config, identity),
      honeypotField: config.requestForm.honeypotField,
      tokenTtlSeconds: config.requestForm.tokenTtlSeconds
    }
  };
});

function identityFromEvent(event: Parameters<typeof getHeader>[0]) {
  return getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() || getHeader(event, 'x-real-ip') || 'anonymous';
}
