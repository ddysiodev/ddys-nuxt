<template>
  <main class="ddys-example">
    <h1>Movies</h1>
    <DdysView view="movies" :params="route.query" />
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
useDdysSeo({ title: 'DDYS Movies', path: '/ddys/movies' });
</script>
