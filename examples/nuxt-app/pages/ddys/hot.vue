<template>
  <main class="ddys-example">
    <h1>Hot</h1>
    <DdysView view="hot" :params="{ limit: 24 }" />
  </main>
</template>

<script setup lang="ts">
useDdysSeo({ title: 'Hot DDYS', path: '/ddys/hot' });
</script>
