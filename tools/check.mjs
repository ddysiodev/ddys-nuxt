import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];

const requiredFiles = [
  'README.md',
  'README.zh-CN.md',
  'LICENSE',
  '.gitignore',
  '.env.example',
  'nuxt.config.example.ts',
  'package.json',
  'tsconfig.json',
  'src/index.ts',
  'src/module.ts',
  'src/runtime/config.ts',
  'src/runtime/plugin.ts',
  'src/runtime/types/ddys.ts',
  'src/runtime/types/nuxt-shims.d.ts',
  'src/runtime/utils/security.ts',
  'src/runtime/utils/display.ts',
  'src/runtime/client/client.ts',
  'src/runtime/client/proxy-client.ts',
  'src/runtime/client/error.ts',
  'src/runtime/client/index.ts',
  'src/runtime/server/index.ts',
  'src/runtime/server/utils/cache.ts',
  'src/runtime/server/utils/client.ts',
  'src/runtime/server/utils/config.ts',
  'src/runtime/server/utils/request-service.ts',
  'src/runtime/server/utils/seo.ts',
  'src/runtime/server/api/proxy.get.ts',
  'src/runtime/server/api/request.get.ts',
  'src/runtime/server/api/request.post.ts',
  'src/runtime/server/api/diagnostics.get.ts',
  'src/runtime/server/api/diagnostics.post.ts',
  'src/runtime/server/api/revalidate.post.ts',
  'src/runtime/composables/useDdys.ts',
  'src/runtime/composables/useDdysClient.ts',
  'src/runtime/composables/useDdysSearch.ts',
  'src/runtime/composables/useDdysRequestForm.ts',
  'src/runtime/composables/useDdysSeo.ts',
  'src/runtime/components/DdysCard.vue',
  'src/runtime/components/DdysGrid.vue',
  'src/runtime/components/DdysMovieDetail.vue',
  'src/runtime/components/DdysSources.vue',
  'src/runtime/components/DdysView.vue',
  'src/runtime/components/DdysSearch.vue',
  'src/runtime/components/DdysRequestForm.vue',
  'src/runtime/components/DdysDiagnostics.vue',
  'src/runtime/styles/ddys.css',
  'public/images/icon-16.png',
  'public/images/icon-32.png',
  'public/images/icon-192.png',
  'public/images/icon-512.png',
  'public/images/logo.png',
  'tests/structure.test.mjs',
  'tools/build-package.ps1',
  'tools/check.mjs'
];

const exampleFiles = [
  'examples/nuxt-app/nuxt.config.ts',
  'examples/nuxt-app/pages/ddys/index.vue',
  'examples/nuxt-app/pages/ddys/latest.vue',
  'examples/nuxt-app/pages/ddys/hot.vue',
  'examples/nuxt-app/pages/ddys/movies.vue',
  'examples/nuxt-app/pages/ddys/search.vue',
  'examples/nuxt-app/pages/ddys/calendar.vue',
  'examples/nuxt-app/pages/ddys/movie/[slug].vue',
  'examples/nuxt-app/pages/ddys/movie/[slug]/sources.vue',
  'examples/nuxt-app/pages/ddys/collections.vue',
  'examples/nuxt-app/pages/ddys/shares.vue',
  'examples/nuxt-app/pages/ddys/types.vue',
  'examples/nuxt-app/pages/ddys/genres.vue',
  'examples/nuxt-app/pages/ddys/regions.vue',
  'examples/nuxt-app/pages/ddys/request.vue',
  'examples/nuxt-app/pages/ddys/diagnostics.vue',
  'examples/nuxt-app/server/routes/sitemap.xml.ts',
  'examples/nuxt-app/server/routes/robots.txt.ts',
  'examples/nuxt-app/server/routes/manifest.webmanifest.ts'
];

const clientMethods = [
  'movies', 'latest', 'hot', 'search', 'suggest', 'calendar',
  'movie', 'sources', 'related', 'comments',
  'collections', 'collection', 'shares', 'share',
  'requests', 'activities', 'user', 'types', 'genres', 'regions',
  'me', 'createRequest', 'createComment', 'deleteComment',
  'reportInvalidResource', 'follow', 'unfollow'
];

for (const file of [...requiredFiles, ...exampleFiles]) await mustExist(file);
await checkEncoding();
await checkPackage();
await checkModule();
await checkClient();
await checkServer();
await checkComposablesAndComponents();
await checkExamples();
await checkAssets();
await checkDocs();
await checkBuildScript();
await checkForbiddenFiles();
await checkForbiddenText();

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, files: (await listFiles(root)).length, examples: exampleFiles.length, clientMethods: clientMethods.length }, null, 2));

async function mustExist(rel) {
  try { await fs.stat(path.join(root, rel)); } catch { failures.push(`Missing required file: ${rel}`); }
}

async function checkEncoding() {
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    if (!isTextFile(rel)) continue;
    const buffer = await fs.readFile(full);
    assert(!(buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf), `${rel} must not contain a UTF-8 BOM.`);
    const text = buffer.toString('utf8');
    assert(!text.includes('\uFFFD'), `${rel} contains Unicode replacement characters.`);
  }
}

async function checkPackage() {
  const pkg = JSON.parse(await read('package.json'));
  assert(pkg.name === 'ddys-nuxt', 'package name mismatch.');
  assert(pkg.type === 'module', 'package must be ESM.');
  assert(pkg.publishConfig?.access === 'public', 'package must be public publishable.');
  assert(pkg.exports?.['.'] && pkg.exports?.['./client'] && pkg.exports?.['./server'] && pkg.exports?.['./types'] && pkg.exports?.['./styles.css'], 'package exports must expose module, client, server, types, and styles.');
  assert(pkg.peerDependencies?.nuxt && pkg.peerDependencies?.vue, 'package must declare Nuxt and Vue peer dependencies.');
  assert(pkg.dependencies?.['@nuxt/kit'] && pkg.dependencies?.h3, 'package must depend on @nuxt/kit and h3.');
  assert(pkg.scripts?.check === 'node tools/check.mjs', 'package check script mismatch.');
}

async function checkModule() {
  const mod = await read('src/module.ts');
  for (const fragment of ['defineNuxtModule', 'addImportsDir', 'addComponentsDir', 'addServerHandler', 'addPlugin', 'runtimeConfig', 'publicAssets', 'routeRules']) {
    assert(mod.includes(fragment), `module missing ${fragment}.`);
  }
  assert(mod.includes('DEFAULT_DDYS_CONFIG.routePrefix') && mod.includes('runtime/server/api/request.post') && mod.includes('runtime/server/api/diagnostics.post') && mod.includes('runtime/server/api/revalidate.post'), 'module must register all Nitro routes.');
}

async function checkClient() {
  const client = await read('src/runtime/client/client.ts');
  for (const method of clientMethods) assert(client.includes(`${method}(`), `DdysClient missing ${method}().`);
  for (const fragment of ['sendWithRetry', "method !== 'GET'", 'Authorization', 'Bearer', "typeof window === 'undefined'", 'finally', 'clearTimeout', 'resolveProxyPath', 'allowRoutes', 'noCache']) {
    assert(client.includes(fragment), `DdysClient missing ${fragment}.`);
  }
  const proxy = await read('src/runtime/client/proxy-client.ts');
  for (const fragment of ['DdysProxyClient', '/proxy', 'createRequest', 'routePrefix']) assert(proxy.includes(fragment), `proxy client missing ${fragment}.`);
  const security = await read('src/runtime/utils/security.ts');
  for (const fragment of ['normalizeBaseUrl', 'buildQuery', 'safeMediaUrl', 'isAllowedResourceUrl', 'formDataToObject', 'maxPerPage']) {
    assert(security.includes(fragment), `security utils missing ${fragment}.`);
  }
}

async function checkServer() {
  const proxy = await read('src/runtime/server/api/proxy.get.ts');
  assert(proxy.includes('cachedDdys') && proxy.includes('Cache-Control') && proxy.includes('X-DDYS-Cache') && proxy.includes('resolveProxyPath'), 'proxy route must cache and validate.');
  const request = await read('src/runtime/server/utils/request-service.ts');
  for (const fragment of ['createRequestFormToken', 'verifyRequestFormToken', 'crypto.subtle', 'enforceRateLimit', 'normalizeRequestInput', 'honeypot', 'DDYS request form is disabled']) {
    assert(request.includes(fragment), `request service missing ${fragment}.`);
  }
  const diagnostics = await read('src/runtime/server/api/diagnostics.get.ts');
  assert(diagnostics.includes('safeEventConfig') && diagnostics.includes('diagnostics.enabled') && diagnostics.includes('composables'), 'diagnostics route must hide secrets and report capabilities.');
  const revalidate = await read('src/runtime/server/api/revalidate.post.ts');
  assert(revalidate.includes('DDYS') || revalidate.includes('revalidateDdysCache'), 'revalidate route must clear cache.');
  const seo = await read('src/runtime/server/utils/seo.ts');
  for (const fragment of ['createDdysSitemap', 'createDdysRobotsText', 'createDdysManifest', 'createDdysMovieJsonLd']) assert(seo.includes(fragment), `SEO helper missing ${fragment}.`);
}

async function checkComposablesAndComponents() {
  for (const file of ['useDdys.ts', 'useDdysClient.ts', 'useDdysSearch.ts', 'useDdysRequestForm.ts', 'useDdysSeo.ts']) {
    const text = await read(`src/runtime/composables/${file}`);
    assert(text.includes('export function'), `${file} must export a composable.`);
  }
  for (const component of ['DdysCard', 'DdysGrid', 'DdysMovieDetail', 'DdysSources', 'DdysView', 'DdysSearch', 'DdysRequestForm', 'DdysDiagnostics']) {
    const text = await read(`src/runtime/components/${component}.vue`);
    assert(text.includes('<template>') && text.includes('<script setup'), `${component} must be a Vue SFC.`);
  }
  const css = await read('src/runtime/styles/ddys.css');
  assert(css.includes('ddys-nuxt-items') && css.includes('ddys-nuxt-request-form') && css.includes('@media') && css.includes('prefers-color-scheme'), 'CSS must include layout, request form, responsive, and dark-mode styles.');
}

async function checkExamples() {
  for (const file of exampleFiles) {
    const text = await read(file);
    assert(text.includes('ddys') || text.includes('Ddys') || text.includes('DDYS'), `${file} must use DDYS integration.`);
  }
  assert((await read('examples/nuxt-app/server/routes/sitemap.xml.ts')).includes('createDdysSitemap'), 'sitemap example missing helper.');
  assert((await read('examples/nuxt-app/server/routes/robots.txt.ts')).includes('createDdysRobotsText'), 'robots example missing helper.');
  assert((await read('examples/nuxt-app/server/routes/manifest.webmanifest.ts')).includes('createDdysManifest'), 'manifest example missing helper.');
}

async function checkAssets() {
  const expected = {
    'public/images/icon-16.png': [16, 16],
    'public/images/icon-32.png': [32, 32],
    'public/images/icon-192.png': [192, 192],
    'public/images/icon-512.png': [512, 512],
    'public/images/logo.png': [512, 512]
  };
  for (const [rel, size] of Object.entries(expected)) {
    const actual = await pngSize(rel);
    assert(actual[0] === size[0] && actual[1] === size[1], `${rel} must be ${size[0]}x${size[1]}, got ${actual[0]}x${actual[1]}.`);
  }
}

async function checkDocs() {
  const en = await read('README.md');
  const zh = await read('README.zh-CN.md');
  assert(en.includes('[中文](README.zh-CN.md)') && zh.includes('[English](README.md)'), 'READMEs must link to each other.');
  for (const fragment of ['ddys-nuxt', 'defineNuxtModule', 'runtimeConfig', 'addServerHandler', 'useDdysClient', 'DdysRequestForm', 'createDdysSitemap', '/api/ddys/proxy', 'NUXT_PUBLIC_*']) {
    assert(en.includes(fragment) && zh.includes(fragment), `READMEs missing ${fragment}.`);
  }
}

async function checkBuildScript() {
  const script = await read('tools/build-package.ps1');
  assert(script.includes('ddys-nuxt-v{0}.zip') && script.includes('StartsWith($resolvedRoot') && script.includes('ZipFileExtensions') && script.includes('Replace("\\", "/")'), 'build-package.ps1 must safely create portable release zip.');
}

async function checkForbiddenFiles() {
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    assert(rel === '.env.example' || !/(^|\/)(\.env|\.env\..*|node_modules|\.nuxt|\.output|coverage|dist)(\/|$)/.test(rel), `Forbidden generated or sensitive path committed: ${rel}`);
    assert(rel !== 'pnpm-lock.yaml', 'pnpm-lock.yaml is a local verification artifact for this source package.');
    assert(!/\.(log|bak|tmp|cache|tgz)$/i.test(rel), `Forbidden generated file committed: ${rel}`);
  }
}

async function checkForbiddenText() {
  const patterns = ['ghp_', 'github_pat_', 'npm_', '\uFFFD', '????', '涓', '闆', '鏄', '鍖', '绔'];
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    if (!isTextFile(rel) || rel === 'tools/check.mjs') continue;
    const text = await read(rel);
    for (const pattern of patterns) assert(!text.includes(pattern), `${rel} contains forbidden text pattern ${pattern}.`);
  }
}

async function read(rel) {
  return fs.readFile(path.join(root, rel), 'utf8');
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (['.git', 'dist', 'node_modules', '.nuxt', '.output', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full));
    else out.push(full);
  }
  return out;
}

async function pngSize(rel) {
  const buffer = await fs.readFile(path.join(root, rel));
  assert(buffer.readUInt32BE(0) === 0x89504e47, `${rel} is not a PNG.`);
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

function isTextFile(rel) {
  return /\.(ts|vue|js|mjs|json|css|md|txt|ps1)$/i.test(rel) || rel === '.gitignore' || rel === 'LICENSE' || rel === '.env.example';
}

function slash(value) {
  return value.replace(/\\/g, '/');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}
