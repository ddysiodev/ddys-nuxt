import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

test('nuxt integration structure check passes', async () => {
  const { stdout } = await exec('node', ['tools/check.mjs']);
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.ok(result.files >= 70);
  assert.ok(result.examples >= 18);
  assert.equal(result.clientMethods, 27);
});
