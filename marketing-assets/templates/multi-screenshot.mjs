import { escapeHtml, screenshotFrame, slideShell } from './helpers.mjs';

export function renderMultiScreenshot(slide, config, screenshots) {
  const frames = screenshots.map((path, index) => screenshotFrame(path, `${slide.copy.headline} ${index + 1}`)).join('');
  return slideShell(slide, config, `<h1 class="headline">${escapeHtml(slide.copy.headline)}</h1><p class="body">${escapeHtml(slide.copy.body)}</p><section class="screens">${frames}</section>`);
}
