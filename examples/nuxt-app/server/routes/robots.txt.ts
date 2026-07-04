import { setHeader } from 'h3';
import { createDdysRobotsText } from 'ddys-nuxt/server';

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return createDdysRobotsText();
});
