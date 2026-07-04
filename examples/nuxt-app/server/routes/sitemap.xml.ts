import { setHeader } from 'h3';
import { createDdysSitemap } from 'ddys-nuxt/server';

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return createDdysSitemap({ basePath: '/ddys' });
});
