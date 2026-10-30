import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createId } from '../src/utils/createId.ts';

const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('prefers randomUUID and preserves its receiver without calling fallback', () => {
  const expected = '12345678-1234-4234-8234-123456789abc';
  const source = {
    randomUUID() { assert.equal(this, source); return expected; },
    getRandomValues() { assert.fail('Fallback should not be called'); },
  };
  assert.equal(createId(source), expected);
});

test('missing randomUUID uses getRandomValues and sets version/variant bits', () => {
  let calls = 0;
  const source = { getRandomValues(bytes) {
    assert.equal(this, source);
    assert.equal(bytes.length, 16);
    calls++;
    return bytes.fill(255);
  } };
  assert.equal(createId(source), 'ffffffff-ffff-4fff-bfff-ffffffffffff');
  assert.equal(calls, 1);
});

test('native and fallback IDs have UUID v4 format and are unique in a 1000-ID sample', () => {
  for (const source of [globalThis.crypto, { getRandomValues: bytes => globalThis.crypto.getRandomValues(bytes) }]) {
    const ids = Array.from({ length: 1000 }, () => createId(source));
    ids.forEach(id => assert.match(id, uuidV4));
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('missing Web Crypto fails clearly instead of using weak randomness', () => {
  assert.throws(() => createId({}), /Web Crypto/);
});
