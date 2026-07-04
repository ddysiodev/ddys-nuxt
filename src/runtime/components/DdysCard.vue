<template>
  <article class="ddys-nuxt-card">
    <a :href="url || undefined" :target="display.target || '_self'" class="ddys-nuxt-poster-link">
      <img v-if="poster && display.showPoster !== false" class="ddys-nuxt-poster" :src="poster" :alt="title" loading="lazy">
      <div v-else class="ddys-nuxt-poster ddys-nuxt-poster-empty">{{ title.slice(0, 2) }}</div>
    </a>
    <div class="ddys-nuxt-card-body">
      <h3 class="ddys-nuxt-title">
        <a v-if="url" :href="url" :target="display.target || '_self'">{{ title }}</a>
        <span v-else>{{ title }}</span>
      </h3>
      <p v-if="meta.length" class="ddys-nuxt-meta">{{ meta.join(' / ') }}</p>
      <p v-if="display.showSummary !== false && summary" class="ddys-nuxt-summary">{{ summary }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DdysDisplayOptions, DdysItem } from '../types/ddys';
import { itemMeta, itemPoster, itemSummary, itemTitle, itemUrl } from '../utils/display';

const props = defineProps<{
  item: DdysItem;
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
}>();

const display = computed(() => props.display ?? {});
const title = computed(() => itemTitle(props.item));
const poster = computed(() => itemPoster(props.item));
const summary = computed(() => itemSummary(props.item));
const meta = computed(() => itemMeta(props.item));
const url = computed(() => itemUrl(props.item, props.siteBaseUrl));
</script>
