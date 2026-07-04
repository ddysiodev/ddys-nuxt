declare module '#imports' {
  export function useRuntimeConfig(event?: unknown): Record<string, any>;
  export function useSeoMeta(input: Record<string, any>): void;
  export function useHead(input: Record<string, any>): void;
  export function useAsyncData<T>(key: string, handler: () => Promise<T>): Promise<{ data: { value: T | null }; pending: { value: boolean }; error: { value: unknown } }>;
  export function useRoute(): { query: Record<string, unknown>; params: Record<string, unknown> };
  export const $fetch: <T = unknown>(request: string, options?: Record<string, unknown>) => Promise<T>;
}

declare module '#app' {
  export function defineNuxtPlugin(plugin: (nuxtApp: unknown) => unknown): unknown;
  export function useNuxtApp(): { $ddys?: unknown };
}
