<template>
  <div class="ddys-nuxt-sources">
    <section v-for="(resources, name) in groups" :key="name" class="ddys-nuxt-source-group">
      <h3>{{ name }}</h3>
      <p v-for="(link, index) in sourceLinks(resources)" :key="`${name}-${index}`" class="ddys-nuxt-resource">
        <a :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { DdysResource } from '../types/ddys';
import { resourceParts } from '../utils/display';

const props = withDefaults(defineProps<{
  groups: Record<string, DdysResource[]>;
  allowedProtocols?: string[];
}>(), {
  allowedProtocols: () => ['http:', 'https:', 'magnet:', 'ed2k:', 'thunder:']
});

function sourceLinks(resources: DdysResource[]) {
  return resources.flatMap((resource) => resourceParts(resource, props.allowedProtocols));
}
</script>
