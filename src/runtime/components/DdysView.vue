<template>
  <div>
    <p v-if="pending" class="ddys-nuxt-status">Loading DDYS content...</p>
    <p v-else-if="error" class="ddys-nuxt-status is-error">{{ errorMessage }}</p>
    <DdysMovieDetail v-else-if="view === 'movie' && detail" :movie="detail" :display="display" :site-base-url="siteBaseUrl" />
    <DdysGrid v-else :items="items" :display="display" :site-base-url="siteBaseUrl" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAsyncData, useRuntimeConfig } from '#imports';
import type { DdysDisplayOptions, DdysItem, DdysQuery } from '../types/ddys';
import { useDdysClient } from '../composables/useDdysClient';
import DdysGrid from './DdysGrid.vue';
import DdysMovieDetail from './DdysMovieDetail.vue';

const props = defineProps<{
  view: 'latest' | 'hot' | 'movies' | 'search' | 'collections' | 'shares' | 'requests' | 'activities' | 'movie' | 'types' | 'genres' | 'regions';
  params?: DdysQuery;
  display?: DdysDisplayOptions;
}>();

const client = useDdysClient();
const runtime = useRuntimeConfig();
const siteBaseUrl = computed(() => String(runtime.public?.ddys?.siteBaseUrl || 'https://ddys.io'));
const key = computed(() => `ddys:${props.view}:${JSON.stringify(props.params ?? {})}`);

const { data, pending, error } = await useAsyncData(key.value, async () => loadView());
const errorMessage = computed(() => error.value instanceof Error ? error.value.message : 'DDYS content failed to load.');
const detail = computed(() => props.view === 'movie' ? data.value as DdysItem | null : null);
const items = computed(() => props.view === 'movie' ? [] : asItems(data.value));

async function loadView() {
  const params = props.params ?? {};
  switch (props.view) {
    case 'latest': return client.latest(params);
    case 'hot': return client.hot(params);
    case 'movies': return (await client.movies(params)).data;
    case 'search': return (await client.search(params)).data;
    case 'collections': return (await client.collections(params)).data;
    case 'shares': return (await client.shares(params)).data;
    case 'requests': return (await client.requests(params)).data;
    case 'activities': return (await client.activities(params)).data;
    case 'movie': return client.movie(String(params.slug || ''));
    case 'types': return dictionary(await client.types());
    case 'genres': return dictionary(await client.genres());
    case 'regions': return dictionary(await client.regions());
    default: return [];
  }
}

function asItems(payload: unknown): DdysItem[] {
  if (Array.isArray(payload)) return payload as DdysItem[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) return (payload as { data: DdysItem[] }).data;
  return [];
}

function dictionary(payload: unknown): DdysItem[] {
  if (Array.isArray(payload)) return payload.map((item) => typeof item === 'object' ? item as DdysItem : { title: String(item) });
  if (payload && typeof payload === 'object') {
    return Object.entries(payload as Record<string, unknown>).map(([code, value]) => typeof value === 'object' && value ? { code, ...(value as Record<string, unknown>) } as DdysItem : { code, title: String(value) });
  }
  return [];
}
</script>
