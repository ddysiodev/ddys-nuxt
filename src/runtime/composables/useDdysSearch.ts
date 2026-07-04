import { ref } from 'vue';
import type { DdysItem } from '../types/ddys';
import { useDdysClient } from './useDdysClient';

export function useDdysSearch() {
  const client = useDdysClient();
  const query = ref('');
  const items = ref<DdysItem[]>([]);
  const pending = ref(false);
  const error = ref('');

  async function search(params: Record<string, unknown> = {}) {
    pending.value = true;
    error.value = '';
    try {
      const payload = await client.search({ ...params, q: query.value });
      items.value = payload.data as DdysItem[];
      return payload;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'DDYS search failed.';
      throw err;
    } finally {
      pending.value = false;
    }
  }

  return { query, items, pending, error, search };
}
