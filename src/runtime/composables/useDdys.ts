import type { DdysQuery } from '../types/ddys';
import { useDdysClient } from './useDdysClient';

export function useDdys() {
  const client = useDdysClient();
  return {
    client,
    movies: (params: DdysQuery = {}) => client.movies(params),
    latest: (params: DdysQuery = {}) => client.latest(params),
    hot: (params: DdysQuery = {}) => client.hot(params),
    search: (params: DdysQuery = {}) => client.search(params),
    suggest: (q: string, params: DdysQuery = {}) => client.suggest(q, params),
    calendar: (params: DdysQuery = {}) => client.calendar(params),
    movie: (slug: string) => client.movie(slug),
    sources: (slug: string) => client.sources(slug),
    related: (slug: string) => client.related(slug),
    comments: (slug: string, params: DdysQuery = {}) => client.comments(slug, params),
    collections: (params: DdysQuery = {}) => client.collections(params),
    collection: (slug: string, params: DdysQuery = {}) => client.collection(slug, params),
    shares: (params: DdysQuery = {}) => client.shares(params),
    share: (id: string | number) => client.share(id),
    requests: (params: DdysQuery = {}) => client.requests(params),
    activities: (params: DdysQuery = {}) => client.activities(params),
    user: (username: string) => client.user(username),
    types: () => client.types(),
    genres: () => client.genres(),
    regions: () => client.regions()
  };
}
