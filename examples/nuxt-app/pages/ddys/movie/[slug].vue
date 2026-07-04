<template>
  <main class="ddys-example">
    <DdysView view="movie" :params="{ slug }" />
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const slug = String(route.params.slug || '');
useDdysSeo({ title: `DDYS ${slug}`, path: `/ddys/movie/${encodeURIComponent(slug)}` });
</script>
