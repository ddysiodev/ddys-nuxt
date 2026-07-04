<template>
  <main class="ddys-example">
    <h1>Genres</h1>
    <DdysView view="genres" :display="{ layout: 'compact' }" />
  </main>
</template>

<script setup lang="ts">
useDdysSeo({ title: 'DDYS Genres', path: '/ddys/genres' });
</script>
