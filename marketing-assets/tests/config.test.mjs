import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_CONFIG, loadConfig, missingAssetReport, validateConfig } from '../generate.mjs';
import { templateNames } from '../templates/index.mjs';

const config = loadConfig(DEFAULT_CONFIG);

test('the first Etsy config is structurally valid at the required 4:3 canvas size', () => {
  assert.deepEqual(validateConfig(config), []);
  assert.equal(config.canvas.width, 2700);
  assert.equal(config.canvas.height, 2025);
  assert.equal(config.canvas.aspectRatio, '4:3');
});

test('slide order and output filenames are unique and templates are supported', () => {
  assert.equal(new Set(config.slides.map((slide) => slide.order)).size, config.slides.length);
  assert.equal(new Set(config.slides.map((slide) => slide.output)).size, config.slides.length);
  const supported = new Set(templateNames());
  config.slides.forEach((slide) => assert.ok(supported.has(slide.template)));
});

test('each screenshot path is config-owned and becomes resolvable when its file is inserted', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'marketing-assets-'));
  try {
    for (const asset of Object.values(config.screenshots)) {
      const destination = path.join(temporaryRoot, asset.path);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, 'approved screenshot placeholder for validation only');
    }
    assert.deepEqual(missingAssetReport(config, temporaryRoot), []);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test('missing screenshots are reported by slide and asset ID without a rendering crash', () => {
  const missing = missingAssetReport(config);
  assert.equal(missing.length, 9);
  assert.deepEqual(missing[0], {
    slide: 1,
    screenshotId: 'home',
    path: 'marketing-assets/source/home.jpeg',
    absolutePath: path.resolve('marketing-assets/source/home.jpeg'),
    exists: false,
  });
  assert.ok(missing.some((asset) => asset.screenshotId === 'playWild' && asset.slide === 7));
});

test('validator identifies duplicate slide order, duplicate output, and unknown templates', () => {
  const invalid = structuredClone(config);
  invalid.slides[1].order = invalid.slides[0].order;
  invalid.slides[1].output = invalid.slides[0].output;
  invalid.slides[2].template = 'unknown-template';
  const errors = validateConfig(invalid).join('\n');
  assert.match(errors, /order values must be unique/);
  assert.match(errors, /output filenames must be unique/);
  assert.match(errors, /invalid template/);
});
