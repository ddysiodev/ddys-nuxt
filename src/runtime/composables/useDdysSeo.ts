import { useHead, useRuntimeConfig, useSeoMeta } from '#imports';
import type { DdysItem } from '../types/ddys';
import { itemPoster, itemSummary, itemTitle, itemUrl } from '../utils/display';

export function useDdysSeo(input: { title?: string; description?: string; path?: string; image?: string } = {}) {
  const runtime = useRuntimeConfig();
  const siteBaseUrl = String(runtime.public?.ddys?.siteBaseUrl || 'https://ddys.io');
  const title = input.title || 'DDYS';
  const description = input.description || 'DDYS API powered movie and video experience.';
  const url = absoluteUrl(siteBaseUrl, input.path || '/ddys');
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogImage: input.image,
    twitterCard: input.image ? 'summary_large_image' : 'summary'
  });
}

export function useDdysMovieSeo(movie: DdysItem, path?: string) {
  const runtime = useRuntimeConfig();
  const siteBaseUrl = String(runtime.public?.ddys?.siteBaseUrl || 'https://ddys.io');
  const title = itemTitle(movie);
  const description = itemSummary(movie) || `${title} - DDYS`;
  const image = itemPoster(movie);
  const url = absoluteUrl(siteBaseUrl, path || itemUrl(movie, siteBaseUrl));
  useDdysSeo({ title, description, path: url, image });
  useHead({
    script: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: title,
        description,
        image,
        url,
        datePublished: movie.year ? String(movie.year) : undefined
      })
    }]
  });
}

function absoluteUrl(baseUrl: string, value: string) {
  try {
    return new URL(value || '/', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  } catch {
    return baseUrl;
  }
}
