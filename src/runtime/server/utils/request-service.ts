import type { DdysConfig } from '../../config';
import type { DdysRequestInput } from '../../types/ddys';
import { choice, scalar } from '../../utils/security';
import { createDdysServerClient } from './client';

export interface DdysRequestSubmitOptions {
  identity?: string;
  token?: string;
  honeypot?: string;
}

const lastRequestByIdentity = new Map<string, number>();

export async function createRequestFormToken(config: DdysConfig, identity = 'anonymous', now = Date.now()): Promise<string> {
  if (!config.requestForm.enabled) return '';
  if (!config.requestForm.csrf) return '';
  const secret = config.requestForm.secret || config.apiKey;
  if (!secret) throw new Error('DDYS_FORM_SECRET or DDYS_API_KEY is required for request form tokens.');
  const issued = Math.floor(now / 1000);
  const payload = `${identity}.${issued}`;
  return `${issued}.${await hmac(secret, payload)}`;
}

export async function verifyRequestFormToken(config: DdysConfig, token = '', identity = 'anonymous', now = Date.now()): Promise<boolean> {
  if (!config.requestForm.csrf) return true;
  const [issuedText, signature] = token.split('.');
  const issued = Number(issuedText);
  if (!issued || !signature) return false;
  if (Math.floor(now / 1000) - issued > config.requestForm.tokenTtlSeconds) return false;
  const secret = config.requestForm.secret || config.apiKey;
  if (!secret) return false;
  return timingSafeEqual(signature, await hmac(secret, `${identity}.${issued}`));
}

export async function submitDdysRequest(input: Record<string, unknown>, config: DdysConfig, options: DdysRequestSubmitOptions = {}) {
  if (!config.requestForm.enabled) throw new Error('DDYS request form is disabled.');
  if (options.honeypot) throw new Error('Invalid request form submission.');
  if (!(await verifyRequestFormToken(config, options.token, options.identity ?? 'anonymous'))) throw new Error('Invalid request form token.');
  enforceRateLimit(options.identity ?? 'anonymous', config.requestForm.rateLimitSeconds);
  const payload = normalizeRequestInput(input);
  return createDdysServerClient(undefined, config).createRequest(payload);
}

export function normalizeRequestInput(input: Record<string, unknown>): DdysRequestInput {
  const title = scalar(input.title).slice(0, 120);
  if (title.length < 2) throw new Error('Title must be at least 2 characters.');
  const year = scalar(input.year);
  if (year && !/^\d{4}$/.test(year)) throw new Error('Year must be a four-digit number.');
  const douban = scalar(input.douban_id || input.douban).replace(/[^\d]/g, '').slice(0, 16);
  const imdb = scalar(input.imdb_id || input.imdb).slice(0, 16);
  if (imdb && !/^tt\d{5,14}$/i.test(imdb)) throw new Error('IMDb ID must look like tt1234567.');
  return {
    title,
    year,
    type: choice(input.type, ['movie', 'series', 'variety', 'anime', ''] as const, ''),
    description: scalar(input.description).slice(0, 1000),
    douban_id: douban,
    imdb_id: imdb,
    site: scalar(input.site).slice(0, 255)
  };
}

export function enforceRateLimit(identity: string, seconds: number) {
  const now = Date.now();
  const previous = lastRequestByIdentity.get(identity) ?? 0;
  if (previous && now - previous < seconds * 1000) throw new Error('Please wait before submitting another request.');
  lastRequestByIdentity.set(identity, now);
}

async function hmac(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return base64Url(new Uint8Array(signature));
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
