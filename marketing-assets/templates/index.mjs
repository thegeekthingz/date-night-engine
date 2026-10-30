import { renderHero } from './hero.mjs';
import { renderFeatureSpotlight } from './feature-spotlight.mjs';
import { renderMultiScreenshot } from './multi-screenshot.mjs';
import { renderWhatIsIncluded } from './what-is-included.mjs';
import { renderInformational } from './informational.mjs';

export const TEMPLATE_RENDERERS = {
  hero: renderHero,
  'feature-spotlight': renderFeatureSpotlight,
  'multi-screenshot': renderMultiScreenshot,
  'what-is-included': renderWhatIsIncluded,
  informational: renderInformational,
};

export function templateNames() {
  return Object.keys(TEMPLATE_RENDERERS);
}

export function renderTemplate(slide, config, screenshotPaths) {
  const renderer = TEMPLATE_RENDERERS[slide.template];
  if (!renderer) {
    throw new Error(`Unknown marketing template: ${slide.template}`);
  }
  return renderer(slide, config, screenshotPaths);
}
