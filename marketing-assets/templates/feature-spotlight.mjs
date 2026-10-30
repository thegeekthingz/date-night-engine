import { escapeHtml, screenshotFrame, slideShell } from './helpers.mjs';

export function renderFeatureSpotlight(slide, config, screenshots) {
  const screen = screenshots[0] ? screenshotFrame(screenshots[0], slide.copy.headline) : '';
  return slideShell(slide, config, `<h1 class="headline">${escapeHtml(slide.copy.headline)}</h1><p class="body">${escapeHtml(slide.copy.body)}</p>${screen}`);
}
