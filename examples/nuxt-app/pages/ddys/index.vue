<template>
  <main class="ddys-example">
    <h1>DDYS</h1>
    <DdysView view="latest" :params="{ limit: 12 }" />
  </main>
</template>

<script setup lang="ts">
useDdysSeo({ title: 'DDYS', path: '/ddys' });
</script>
