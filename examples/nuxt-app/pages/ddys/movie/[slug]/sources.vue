<template>
  <main class="ddys-example">
    <h1>Sources</h1>
    <DdysSources :groups="groups" />
  </main>
</template>

<script setup lang="ts">
import type { DdysResource } from 'ddys-nuxt/types';

const route = useRoute();
const ddys = useDdysClient();
const slug = String(route.params.slug || '');
const sources = await ddys.sources(slug) as Record<string, unknown>;
const groups = {
  Resources: (Array.isArray(sources) ? sources : Array.isArray(sources.resources) ? sources.resources : []) as DdysResource[]
};
useDdysSeo({ title: `DDYS Sources ${slug}`, path: `/ddys/movie/${encodeURIComponent(slug)}/sources` });
</script>
