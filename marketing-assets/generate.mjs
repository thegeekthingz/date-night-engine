#!/usr/bin/env node
/** Validate a marketing config now; render only after real screenshots are supplied. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { templateNames } from './templates/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_CONFIG = path.join(ROOT, 'marketing-assets/config/spill-or-sip-girls-night.etsy.json');

export function loadConfig(configPath = DEFAULT_CONFIG) {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export function validateConfig(config) {
  const errors = [];
  if (config.schemaVersion !== '1.0') errors.push('schemaVersion must be 1.0.');
  if (config.canvas?.width !== 2700 || config.canvas?.height !== 2025 || config.canvas?.aspectRatio !== '4:3') {
    errors.push('canvas must be exactly 2700 × 2025 with a 4:3 aspect ratio.');
  }
  const slides = config.slides ?? [];
  const orders = slides.map((slide) => slide.order);
  if (new Set(orders).size !== orders.length) errors.push('slide order values must be unique.');
  const outputs = slides.map((slide) => slide.output);
  if (new Set(outputs).size !== outputs.length) errors.push('slide output filenames must be unique.');
  const validTemplates = new Set(templateNames());
  for (const slide of slides) {
    if (!validTemplates.has(slide.template)) errors.push(`slide ${slide.order} uses invalid template "${slide.template}".`);
    for (const screenshotId of slide.screenshots ?? []) {
      if (!config.screenshots?.[screenshotId]) errors.push(`slide ${slide.order} references unknown screenshot "${screenshotId}".`);
    }
  }
  return errors;
}

export function requiredAssets(config, root = ROOT) {
  const requirements = [];
  for (const slide of config.slides ?? []) {
    for (const screenshotId of slide.screenshots ?? []) {
      const asset = config.screenshots[screenshotId];
      const absolutePath = path.resolve(root, asset.path);
      requirements.push({ slide: slide.order, screenshotId, path: asset.path, absolutePath, exists: fs.existsSync(absolutePath) });
    }
  }
  return requirements;
}

export function missingAssetReport(config, root = ROOT) {
  return requiredAssets(config, root).filter((asset) => !asset.exists);
}

export function validate(configPath = DEFAULT_CONFIG, root = ROOT) {
  const config = loadConfig(configPath);
  return { config, errors: validateConfig(config), missingAssets: missingAssetReport(config, root) };
}

function printValidation(result) {
  if (result.errors.length) {
    console.error('Invalid marketing config:');
    result.errors.forEach((error) => console.error(`- ${error}`));
    return 1;
  }
  console.log('Marketing config is structurally valid.');
  if (result.missingAssets.length) {
    console.log('Screenshot assets still required before rendering:');
    result.missingAssets.forEach((asset) => console.log(`- Slide ${String(asset.slide).padStart(2, '0')}: ${asset.screenshotId} → ${asset.path}`));
  } else {
    console.log('All required screenshots are available.');
  }
  return 0;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}`) {
  const shouldRender = process.argv.includes('--render');
  const result = validate();
  const status = printValidation(result);
  if (status) process.exitCode = status;
  else if (shouldRender) {
    if (result.missingAssets.length) {
      console.error('Rendering is blocked: add the listed approved real screenshots first. No placeholder images were created.');
      process.exitCode = 1;
    } else {
      console.error('Rendering is not enabled in this foundation milestone. Add the approved Playwright renderer in the production-rendering milestone.');
      process.exitCode = 1;
    }
  }
}
