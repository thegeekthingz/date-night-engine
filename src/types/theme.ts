export type GameTheme = {
  id: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    mutedText: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  borderRadius: string;
  logo?: string;
  backgroundAsset?: string;
  buttonStyle: 'solid' | 'soft' | 'outline';
  cardStyle: 'flat' | 'elevated' | 'glass';
};
