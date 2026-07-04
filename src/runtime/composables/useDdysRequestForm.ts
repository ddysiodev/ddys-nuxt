import { ref } from 'vue';
import { $fetch, useRuntimeConfig } from '#imports';

export function useDdysRequestForm() {
  const runtime = useRuntimeConfig();
  const routePrefix = String(runtime.public?.ddys?.routePrefix || '/api/ddys');
  const token = ref('');
  const honeypotField = ref(String(runtime.public?.ddys?.requestForm?.honeypotField || 'ddys_website'));
  const pending = ref(false);
  const status = ref('');
  const error = ref('');

  async function loadToken() {
    const payload = await $fetch<{ data?: { token?: string; honeypotField?: string } }>(`${routePrefix}/request`);
    token.value = payload.data?.token || '';
    honeypotField.value = payload.data?.honeypotField || honeypotField.value;
    return payload;
  }

  async function submit(input: Record<string, unknown>) {
    pending.value = true;
    status.value = '';
    error.value = '';
    try {
      const payload = await $fetch(`${routePrefix}/request`, {
        method: 'POST',
        body: { ...input, token: token.value }
      });
      status.value = 'Request submitted.';
      return payload;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'DDYS request failed.';
      throw err;
    } finally {
      pending.value = false;
    }
  }

  return { token, honeypotField, pending, status, error, loadToken, submit };
}
