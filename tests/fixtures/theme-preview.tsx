import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import PlayScreen from '../../src/screens/PlayScreen';
import { loadDefaultGame } from '../../src/data/defaultGame';
import { loadCardPack } from '../../src/engine/gameLoader';
import { themeStyle } from '../../src/theme/themeStyle';
import mediaCards from './media-cards.json';
import '../../src/styles.css';

// Development-only presentation fixture; never imported by the production entry point.
const cards = loadCardPack(mediaCards);
const game = loadDefaultGame();
function Preview() {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(false);
  const card = cards[index]!;
  const shown = broken ? { ...card, media: [{ id: 'broken', type: 'image' as const, src: '/media/missing-test.webp', alt: 'Missing test image' }] } : card;
  const next = () => { setBroken(false); setIndex((index + 1) % cards.length); };
  return <main className="app-shell screen-playing" style={themeStyle(game.theme)}>
    <PlayScreen manifest={game.manifest} view={{ currentPlayer: undefined, card: shown, category: game.manifest.categories.find(item => item.id === card.categoryId)!.label, actions: game.manifest.actions, exhausted: false }}
      playedCount={index + 1} totalCards={cards.length} onNext={next} onSkip={next} onEnd={() => setIndex(0)} onRestart={() => setIndex(0)} onSetup={() => setIndex(0)} />
    <button onClick={() => setBroken(true)}>Broken media</button>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
