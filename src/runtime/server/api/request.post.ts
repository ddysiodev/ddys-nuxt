import { createError, defineEventHandler, getHeader, readBody } from 'h3';
import { submitDdysRequest } from '../utils/request-service';
import { getDdysConfig } from '../utils/config';

export default defineEventHandler(async (event) => {
  const config = getDdysConfig(event);
  const body = await readBody<Record<string, unknown>>(event);
  const token = typeof body.token === 'string' ? body.token : '';
  const honeypotField = config.requestForm.honeypotField;
  const honeypot = typeof body[honeypotField] === 'string' ? String(body[honeypotField]) : '';
  try {
    const data = await submitDdysRequest(body, config, {
      token,
      honeypot,
      identity: identityFromEvent(event)
    });
    return { success: true, data };
  } catch (error) {
    throw createError({
      statusCode: statusFor(error),
      statusMessage: error instanceof Error ? error.message : 'DDYS request failed.'
    });
  }
});

function identityFromEvent(event: Parameters<typeof getHeader>[0]) {
  return getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() || getHeader(event, 'x-real-ip') || 'anonymous';
}

function statusFor(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/disabled/i.test(message)) return 403;
  if (/token|honeypot|invalid/i.test(message)) return 422;
  if (/wait/i.test(message)) return 429;
  return 500;
}
