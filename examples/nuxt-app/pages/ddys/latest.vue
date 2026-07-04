<template>
  <main class="ddys-example">
    <h1>Latest</h1>
    <DdysView view="latest" :params="{ limit: 24 }" />
  </main>
</template>

<script setup lang="ts">
useDdysSeo({ title: 'Latest DDYS', path: '/ddys/latest' });
</script>
