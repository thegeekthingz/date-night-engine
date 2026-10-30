import { useState } from 'react';
import { loadDefaultGame } from './data/defaultGame';
import GameplayShell from './components/GameplayShell';

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

  return result.game ? <GameplayShell game={result.game} />
    : <main><h1>Unable to load game</h1><p role="alert">{result.error}</p></main>;
}
