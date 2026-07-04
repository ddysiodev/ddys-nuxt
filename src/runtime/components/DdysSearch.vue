<template>
  <section class="ddys-nuxt-search-block">
    <form class="ddys-nuxt-search" @submit.prevent="runSearch">
      <input v-model="query" name="q" type="search" placeholder="Search DDYS" autocomplete="off">
      <button type="submit" :disabled="pending">Search</button>
    </form>
    <p v-if="error" class="ddys-nuxt-status is-error">{{ error }}</p>
    <p v-else-if="pending" class="ddys-nuxt-status">Searching...</p>
    <DdysGrid v-if="items.length" :items="items" />
  </section>
</template>

<script setup lang="ts">
import { useDdysSearch } from '../composables/useDdysSearch';
import DdysGrid from './DdysGrid.vue';

const { query, items, pending, error, search } = useDdysSearch();

async function runSearch() {
  if (!query.value.trim()) return;
  await search();
}
</script>
