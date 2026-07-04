# DDYS API Nuxt 模块

[English](README.md)

`ddys-nuxt` 是低端影视 API 的官方 Nuxt 模块，提供 TypeScript API Client、Nuxt composables、自动注册 Vue 组件、Nitro server routes、runtimeConfig 隔离、缓存辅助、SEO 辅助、诊断接口、安全求片表单和可直接复制的 Nuxt app 示例。

## 安装

```bash
npm install ddys-nuxt
```

添加模块：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['ddys-nuxt'],
  ddys: {
    routePrefix: '/api/ddys'
  }
});
```

## 环境变量

```env
DDYS_API_BASE_URL=https://ddys.io/api/v1
DDYS_SITE_BASE_URL=https://ddys.io
DDYS_API_KEY=
DDYS_FORM_SECRET=
DDYS_REQUEST_FORM_ENABLED=false
DDYS_DIAGNOSTICS_ENABLED=false
DDYS_REVALIDATE_TOKEN=
```

`DDYS_API_KEY`、`DDYS_FORM_SECRET`、`DDYS_REVALIDATE_TOKEN` 必须只在服务端使用，不要放进 `runtimeConfig.public` 或 `NUXT_PUBLIC_*`。

## 模块能力

- 使用 `defineNuxtModule` 作为正式模块入口，并写入 `runtimeConfig` 默认值。
- 使用 `addImportsDir` 自动注入 composables。
- 使用 `addComponentsDir` 自动注册 `Ddys*` 组件。
- 使用 `addServerHandler` 注册 Nitro API 路由。
- 将图标作为 Nitro public assets 暴露到 `/ddys-nuxt/images`。
- 为 DDYS proxy 响应提供 route rules 和服务端内存缓存。

## Composables

```vue
<script setup lang="ts">
const ddys = useDdys();
const latest = await ddys.latest({ limit: 12 });
</script>
```

可用 composables：

- `useDdys`
- `useDdysClient`
- `useDdysSearch`
- `useDdysRequestForm`
- `useDdysSeo`
- `useDdysMovieSeo`

模块也会注入带类型的 Nuxt app helper：

```ts
const { $ddys } = useNuxtApp();
const hot = await $ddys.hot({ limit: 12 });
```

## 组件

```vue
<template>
  <DdysView view="latest" :params="{ limit: 12 }" />
  <DdysSearch />
  <DdysRequestForm />
</template>
```

可用组件：

- `DdysView`
- `DdysGrid`
- `DdysCard`
- `DdysMovieDetail`
- `DdysSources`
- `DdysSearch`
- `DdysRequestForm`
- `DdysDiagnostics`

## Nitro Routes

模块会注册：

- `GET /api/ddys/proxy`
- `GET /api/ddys/request`
- `POST /api/ddys/request`
- `GET /api/ddys/diagnostics`
- `POST /api/ddys/diagnostics`
- `POST /api/ddys/revalidate`

浏览器端 composables 和组件只调用这些路由，DDYS API key 不会进入浏览器 bundle。

## 服务端 Client

```ts
import { createDdysServerClient } from 'ddys-nuxt/server';

export default defineEventHandler(async (event) => {
  const client = createDdysServerClient(event);
  return client.latest({ limit: 12 });
});
```

Client 覆盖 `movies`、`latest`、`hot`、`search`、`suggest`、`calendar`、`movie`、`sources`、`related`、`comments`、`collections`、`collection`、`shares`、`share`、`requests`、`activities`、`user`、`types`、`genres`、`regions`、`me`、`createRequest`、`createComment`、`deleteComment`、`reportInvalidResource`、`follow`、`unfollow`。

## 求片表单

只有配置 API Key 后才建议开启：

```env
DDYS_API_KEY=...
DDYS_FORM_SECRET=...
DDYS_REQUEST_FORM_ENABLED=true
```

求片路由会在调用低端影视认证 API 前校验标题、年份、类型、豆瓣 ID、IMDb ID、蜜罐字段、表单 token 和单身份提交频率。求片表单关闭时，token 接口会返回空 token，不要求配置 `DDYS_FORM_SECRET`。

## SEO 与 PWA

页面里使用 `useDdysSeo()` / `useDdysMovieSeo()`。服务端辅助包括：

- `createDdysSitemap`
- `createDdysRobotsText`
- `createDdysManifest`
- `createDdysMovieJsonLd`

`examples/nuxt-app` 目录包含 `/sitemap.xml`、`/robots.txt`、`/manifest.webmanifest` server routes 示例。

## 开发检查

```bash
pnpm typecheck
node tools/check.mjs
node --test tests/structure.test.mjs
powershell -ExecutionPolicy Bypass -File tools/build-package.ps1 -Version 0.1.0
```

发布 ZIP 会生成到 `dist/ddys-nuxt-v0.1.0.zip`。
