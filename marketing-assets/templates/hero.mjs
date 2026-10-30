import { escapeHtml, screenshotFrame, slideShell } from './helpers.mjs';

export function renderHero(slide, config, screenshots) {
  const screen = screenshots[0] ? screenshotFrame(screenshots[0], slide.copy.headline) : '';
  return slideShell(slide, config, `
    <p class="eyebrow">${escapeHtml(slide.copy.eyebrow)}</p>
    <h1 class="headline">${escapeHtml(slide.copy.headline)}</h1>
    <p class="body">${escapeHtml(slide.copy.subhead)}</p>
    <p class="body">${escapeHtml(slide.copy.cta)}</p>${screen}`);
}
