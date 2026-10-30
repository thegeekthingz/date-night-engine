import { escapeHtml, slideShell } from './helpers.mjs';

export function renderInformational(slide, config) {
  return slideShell(slide, config, `<p class="eyebrow">${escapeHtml(config.product.edition)}</p><h1 class="headline">${escapeHtml(slide.copy.headline)}</h1><p class="body">${escapeHtml(slide.copy.body)}</p>`);
}
