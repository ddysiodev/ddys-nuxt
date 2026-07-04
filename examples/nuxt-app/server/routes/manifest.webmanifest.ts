import { setHeader } from 'h3';
import { createDdysManifest } from 'ddys-nuxt/server';

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/manifest+json; charset=utf-8');
  return createDdysManifest({ name: 'DDYS', shortName: 'DDYS', startUrl: '/ddys' });
});
