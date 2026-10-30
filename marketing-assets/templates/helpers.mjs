export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

export function slideShell(slide, config, content) {
  const { canvas, palette, typography } = config;
  const style = [
    `--canvas-width:${canvas.width}px`,
    `--canvas-height:${canvas.height}px`,
    `--background:${palette.background}`, `--surface:${palette.surface}`,
    `--light-surface:${palette.lightSurface}`, `--pink:${palette.pink}`,
    `--coral:${palette.coral}`, `--blush:${palette.blush}`,
    `--light-text:${palette.lightText}`, `--muted-text:${palette.mutedText}`,
    `--display-font:${typography.display}`, `--body-font:${typography.body}`,
    `--headline-size:${typography.heroSizePx}px`, `--body-size:${typography.bodySizePx}px`,
  ].join(';');
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="base.css"></head><body><main class="slide ${slide.template}" style="${style}">${content}</main></body></html>`;
}

export function screenshotFrame(path, alt) {
  return `<figure class="screen-frame"><img src="${escapeHtml(path)}" alt="${escapeHtml(alt)}"></figure>`;
}
