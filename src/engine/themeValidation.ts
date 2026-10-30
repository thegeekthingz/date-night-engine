import type { GameTheme } from '../types/theme.ts';
import { object, oneOf, optional, string } from './validation.ts';

export const parseTheme = object<GameTheme>({
  id: string,
  colors: object<GameTheme['colors']>({
    background: string,
    surface: string,
    primary: string,
    secondary: string,
    text: string,
    mutedText: string,
  }),
  typography: object<GameTheme['typography']>({
    headingFont: string,
    bodyFont: string,
  }),
  borderRadius: string,
  logo: optional(string),
  backgroundAsset: optional(string),
  buttonStyle: oneOf('solid', 'soft', 'outline'),
  cardStyle: oneOf('flat', 'elevated', 'glass'),
});
