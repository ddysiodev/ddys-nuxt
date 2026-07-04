# DDYS API Nuxt Module

[中文](README.zh-CN.md)

`ddys-nuxt` is the official Nuxt module for the DDYS API. It provides a TypeScript API client, Nuxt composables, auto-registered Vue components, Nitro server routes, runtime config isolation, cache helpers, SEO helpers, diagnostics, secure request-form handling, and ready-to-copy Nuxt app examples.

## Installation

```bash
npm install ddys-nuxt
```

Add the module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['ddys-nuxt'],
  ddys: {
    routePrefix: '/api/ddys'
  }
});
```

## Environment

```env
DDYS_API_BASE_URL=https://ddys.io/api/v1
DDYS_SITE_BASE_URL=https://ddys.io
DDYS_API_KEY=
DDYS_FORM_SECRET=
DDYS_REQUEST_FORM_ENABLED=false
DDYS_DIAGNOSTICS_ENABLED=false
DDYS_REVALIDATE_TOKEN=
```

`DDYS_API_KEY`, `DDYS_FORM_SECRET`, and `DDYS_REVALIDATE_TOKEN` are server-only. Do not expose them through `runtimeConfig.public` or `NUXT_PUBLIC_*`.

## Module Features

- `defineNuxtModule` module entry with `runtimeConfig` defaults.
- `addImportsDir` for composables.
- `addComponentsDir` for `Ddys*` components.
- `addServerHandler` for Nitro API routes.
- Nitro public assets for icons under `/ddys-nuxt/images`.
- Route rules and server memory cache for DDYS proxy responses.

## Composables

```vue
<script setup lang="ts">
const ddys = useDdys();
const latest = await ddys.latest({ limit: 12 });
</script>
```

Available composables:

- `useDdys`
- `useDdysClient`
- `useDdysSearch`
- `useDdysRequestForm`
- `useDdysSeo`
- `useDdysMovieSeo`

## Components

```vue
<template>
  <DdysView view="latest" :params="{ limit: 12 }" />
  <DdysSearch />
  <DdysRequestForm />
</template>
```

Available components:

- `DdysView`
- `DdysGrid`
- `DdysCard`
- `DdysMovieDetail`
- `DdysSources`
- `DdysSearch`
- `DdysRequestForm`
- `DdysDiagnostics`

## Nitro Routes

The module registers:

- `GET /api/ddys/proxy`
- `GET /api/ddys/request`
- `POST /api/ddys/request`
- `GET /api/ddys/diagnostics`
- `POST /api/ddys/diagnostics`
- `POST /api/ddys/revalidate`

Browser composables and components call these routes. The DDYS API key never enters the browser bundle.

## Server Client

```ts
import { createDdysServerClient } from 'ddys-nuxt/server';

export default defineEventHandler(async (event) => {
  const client = createDdysServerClient(event);
  return client.latest({ limit: 12 });
});
```

The client supports `movies`, `latest`, `hot`, `search`, `suggest`, `calendar`, `movie`, `sources`, `related`, `comments`, `collections`, `collection`, `shares`, `share`, `requests`, `activities`, `user`, `types`, `genres`, `regions`, `me`, `createRequest`, `createComment`, `deleteComment`, `reportInvalidResource`, `follow`, and `unfollow`.

## Request Form

Enable it only with an API key:

```env
DDYS_API_KEY=...
DDYS_FORM_SECRET=...
DDYS_REQUEST_FORM_ENABLED=true
```

The request route validates title, year, type, Douban ID, IMDb ID, honeypot, form token, and per-identity rate limit before using the authenticated DDYS API.

## SEO And PWA

Use `useDdysSeo()` / `useDdysMovieSeo()` in pages. Server helpers include:

- `createDdysSitemap`
- `createDdysRobotsText`
- `createDdysManifest`
- `createDdysMovieJsonLd`

The `examples/nuxt-app` folder includes `/sitemap.xml`, `/robots.txt`, and `/manifest.webmanifest` server routes.

## Development Checks

```bash
pnpm typecheck
node tools/check.mjs
node --test tests/structure.test.mjs
powershell -ExecutionPolicy Bypass -File tools/build-package.ps1 -Version 0.1.0
```

The release ZIP is written to `dist/ddys-nuxt-v0.1.0.zip`.
