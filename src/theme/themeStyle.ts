import type { CSSProperties } from 'react';
import type { GameTheme } from '../types/theme';

// Map the existing theme contract to presentation tokens without changing game data.
export function themeStyle(theme: GameTheme): CSSProperties {
  return {
    '--background': theme.colors.background,
    '--surface': theme.colors.surface,
    '--primary': theme.colors.primary,
    '--secondary': theme.colors.secondary,
    '--text': theme.colors.text,
    '--muted': theme.colors.mutedText,
    '--font-display': theme.typography.headingFont,
    '--font-body': theme.typography.bodyFont,
    '--radius-card': theme.borderRadius,
  } as CSSProperties;
}
