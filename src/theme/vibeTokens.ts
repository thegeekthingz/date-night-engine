import type { CSSProperties } from 'react';
import type { Vibe } from '../types/game';
export type VibeTokens = {
  accent: string; strong: string; soft: string; border: string; progress: string; tint: string; glow: string; highlight: string; atmosphere: string; reveal: string;
};
// One accent layer, not four page themes. Shared neutrals, typography and CTA stay in the base.
export const VIBE_TOKENS: Readonly<Record<Vibe, Readonly<VibeTokens>>> = {
  cozy: { accent: '#E8CA8D', strong: '#D9AA5F', soft: '#393122', border: '#B49460', progress: '#D9B571', tint: '#3D3122', glow: 'rgba(232, 177, 87, 0.22)', highlight: '#F5DC9E', atmosphere: 'rgba(207, 139, 54, 0.16)', reveal: '#453623' },
  funny: { accent: '#FFAA86', strong: '#F88362', soft: '#493027', border: '#D9906D', progress: '#FFC66D', tint: '#432E28', glow: 'rgba(255, 133, 84, 0.26)', highlight: '#F6DE89', atmosphere: 'rgba(245, 121, 68, 0.20)', reveal: '#4A3827' },
  romantic: { accent: '#E2A0C0', strong: '#C77DAB', soft: '#382630', border: '#AF7899', progress: '#D792B4', tint: '#3E2838', glow: 'rgba(204, 104, 163, 0.23)', highlight: '#EAC1D6', atmosphere: 'rgba(137, 57, 104, 0.21)', reveal: '#422B3B' },
  competitive: { accent: '#F1A05F', strong: '#E58A43', soft: '#3D2C20', border: '#D49660', progress: '#F5B55E', tint: '#422E21', glow: 'rgba(230, 135, 56, 0.24)', highlight: '#F5CD86', atmosphere: 'rgba(190, 99, 31, 0.19)', reveal: '#473323' },
};
export function vibeStyle(vibe: Vibe): CSSProperties {
  const t = VIBE_TOKENS[vibe];
  return { '--vibe-accent': t.accent, '--vibe-accent-strong': t.strong, '--vibe-accent-soft': t.soft,
    '--vibe-border': t.border, '--vibe-progress': t.progress, '--vibe-surface-tint': t.tint,
    '--vibe-glow': t.glow, '--vibe-highlight': t.highlight, '--vibe-background-glow': t.atmosphere, '--vibe-reveal-surface': t.reveal } as CSSProperties;
}
