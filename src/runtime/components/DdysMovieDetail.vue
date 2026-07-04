<template>
  <article class="ddys-nuxt ddys-nuxt-detail">
    <DdysCard :item="movie" :display="display" :site-base-url="siteBaseUrl" />
    <p v-if="summary" class="ddys-nuxt-description">{{ summary }}</p>
    <DdysSources v-if="Object.keys(groups).length" :groups="groups" />
    <section v-if="related.length" class="ddys-nuxt-related">
      <h2>Related</h2>
      <DdysGrid :items="related" :display="display" :site-base-url="siteBaseUrl" />
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DdysDisplayOptions, DdysItem, DdysResource } from '../types/ddys';
import { itemSummary } from '../utils/display';
import DdysCard from './DdysCard.vue';
import DdysGrid from './DdysGrid.vue';
import DdysSources from './DdysSources.vue';

const props = defineProps<{
  movie: DdysItem;
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
}>();

const summary = computed(() => itemSummary(props.movie));
const related = computed(() => Array.isArray(props.movie.movies) ? props.movie.movies : []);
const groups = computed(() => {
  const out: Record<string, DdysResource[]> = {};
  if (Array.isArray(props.movie.resources)) out.Resources = props.movie.resources;
  if (Array.isArray(props.movie.sources)) out.Sources = props.movie.sources;
  if (Array.isArray(props.movie.online)) out.Online = props.movie.online;
  if (Array.isArray(props.movie.download)) out.Download = props.movie.download;
  return out;
});
</script>
