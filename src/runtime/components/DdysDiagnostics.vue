<template>
  <section class="ddys-nuxt-diagnostics">
    <div class="ddys-nuxt-actions">
      <button type="button" @click="load">Load</button>
      <button type="button" @click="test">Test API</button>
    </div>
    <p class="ddys-nuxt-status" :class="{ 'is-error': isError }">{{ status }}</p>
    <pre v-if="payload">{{ payload }}</pre>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { $fetch, useRuntimeConfig } from '#imports';

const runtime = useRuntimeConfig();
const routePrefix = String(runtime.public?.ddys?.routePrefix || '/api/ddys');
const status = ref('Idle.');
const payload = ref('');
const isError = ref(false);

async function load() {
  await call('GET');
}

async function test() {
  await call('POST');
}

async function call(method: 'GET' | 'POST') {
  isError.value = false;
  status.value = 'Loading...';
  try {
    const data = await $fetch(`${routePrefix}/diagnostics`, { method });
    payload.value = JSON.stringify(data, null, 2);
    status.value = 'OK';
  } catch (error) {
    isError.value = true;
    status.value = error instanceof Error ? error.message : 'Diagnostics failed.';
  }
}
</script>
