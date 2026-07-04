<template>
  <form class="ddys-nuxt-request-form" @submit.prevent="send">
    <input v-model="form.title" name="title" required maxlength="120" placeholder="Title">
    <input v-model="form.year" name="year" inputmode="numeric" placeholder="Year">
    <select v-model="form.type" name="type">
      <option value="">Type</option>
      <option value="movie">Movie</option>
      <option value="series">Series</option>
      <option value="variety">Variety</option>
      <option value="anime">Anime</option>
    </select>
    <input v-model="form.douban_id" name="douban_id" placeholder="Douban ID">
    <input v-model="form.imdb_id" name="imdb_id" placeholder="IMDb ID">
    <textarea v-model="form.description" name="description" maxlength="1000" placeholder="Notes" />
    <label class="ddys-nuxt-honeypot">Website<input v-model="honeypot" :name="honeypotField" autocomplete="off" tabindex="-1"></label>
    <button type="submit" :disabled="pending">Submit</button>
    <p v-if="error" class="ddys-nuxt-status is-error">{{ error }}</p>
    <p v-else-if="status" class="ddys-nuxt-status">{{ status }}</p>
  </form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useDdysRequestForm } from '../composables/useDdysRequestForm';

const { honeypotField, pending, status, error, loadToken, submit } = useDdysRequestForm();
const honeypot = ref('');
const form = reactive({
  title: '',
  year: '',
  type: '',
  douban_id: '',
  imdb_id: '',
  description: ''
});

onMounted(() => {
  loadToken().catch(() => undefined);
});

async function send() {
  await submit({ ...form, [honeypotField.value]: honeypot.value });
}
</script>
