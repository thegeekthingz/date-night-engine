import { useState } from 'react';
import { loadDefaultGame } from './data/defaultGame';
import HomeScreen from './screens/HomeScreen';
import { themeStyle } from './theme/themeStyle';

export default function App() {
  const [result] = useState(() => {
    try {
      return { game: loadDefaultGame(), error: null };
    } catch (error) {
      return {
        game: null,
        error: error instanceof Error ? error.message : 'Unable to load game data.',
      };
    }
  });

  return result.game ? <main className="app-shell screen-home" data-theme={result.game.theme.id}
    style={themeStyle(result.game.theme)}>
    <HomeScreen manifest={result.game.manifest} />
  </main>
    : <main><h1>Unable to load game</h1><p role="alert">{result.error}</p></main>;
}
