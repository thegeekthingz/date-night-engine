import type { GameManifest } from '../types/game';
import type { getPlayView } from '../engine/gameplayShell';
import GameCard from '../components/GameCard';
import ActionButtons from '../components/ActionButtons';

export default function PlayScreen({ manifest, view, playedCount, totalCards, onNext, onSkip, onEnd, onRestart, onSetup, hint = 0 }: {
  hint?: 0 | 1 | 2;
  manifest: GameManifest; view: ReturnType<typeof getPlayView>; playedCount: number; totalCards: number;
  onNext: (actionId: string) => void; onSkip: () => void; onEnd: () => void; onRestart: () => void; onSetup: () => void;
}) {
  const blocked = view.exhausted && manifest.endCondition !== 'deck_complete';
  return <>
    <header className="play-header"><div><h1>{manifest.name}</h1>
      {manifest.edition && <p>{manifest.edition}</p>}</div>
      <button className="button-quiet" onClick={onEnd}>End Game</button></header>
    <div className="progress-row"><progress className="sr-only" aria-label="Cards played" value={playedCount} max={totalCards || 1} />
      <span className="progress-track" aria-hidden="true"><span className="progress-fill" style={{ width: `${Math.min(100, playedCount / (totalCards || 1) * 100)}%` }} /></span>
      <span>{playedCount} / {totalCards}</span></div>
    <div aria-live="polite" aria-atomic="true">
      {view.currentPlayer && <p key={view.currentPlayer.id} className="player-turn">{view.currentPlayer.name}, you're up</p>}
      {view.card && <GameCard key={view.card.id} card={view.card} category={view.category} />}
      <span className="sr-only">Cards played: {playedCount}</span>
      {view.exhausted && <p className="exhausted">No eligible cards remaining.</p>}
    </div>
    <div className={`idle-hint idle-hint-${hint}`}><ActionButtons actions={view.actions} onAction={onNext} disabled={!view.card || blocked} /></div>
    <nav className="buttons play-navigation" aria-label="Card navigation">
      <button className="button-quiet" onClick={onSkip} disabled={blocked}>Skip this card</button>
    </nav>
    {view.exhausted && <div className="buttons recovery-actions">
      <button onClick={onRestart}>Restart Deck</button><button onClick={onSetup}>Change Vibe</button>
    </div>}
  </>;
}
