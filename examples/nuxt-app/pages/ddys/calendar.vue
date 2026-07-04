<template>
  <main class="ddys-example">
    <h1>Calendar</h1>
    <DdysView view="latest" :params="{ limit: 12 }" />
  </main>
</template>

<script setup lang="ts">
useDdysSeo({ title: 'DDYS Calendar', path: '/ddys/calendar' });
</script>
