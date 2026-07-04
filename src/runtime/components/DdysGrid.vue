<template>
  <section :class="['ddys-nuxt', `ddys-nuxt-theme-${theme}`, `ddys-nuxt-layout-${layout}`]" :style="styleVars">
    <div v-if="items.length" class="ddys-nuxt-items">
      <DdysCard v-for="(item, index) in items" :key="String(item.id ?? item.slug ?? index)" :item="item" :display="display" :site-base-url="siteBaseUrl" />
    </div>
    <p v-else class="ddys-nuxt-empty">{{ emptyText }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import type { DdysDisplayOptions, DdysItem } from '../types/ddys';
import DdysCard from './DdysCard.vue';

const props = defineProps<{
  items: DdysItem[];
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
  emptyText?: string;
}>();

const display = computed(() => props.display ?? {});
const theme = computed(() => display.value.theme ?? 'auto');
const layout = computed(() => display.value.layout ?? 'grid');
const styleVars = computed(() => ({ '--ddys-nuxt-columns': String(display.value.columns ?? 4) }) as CSSProperties);
</script>
