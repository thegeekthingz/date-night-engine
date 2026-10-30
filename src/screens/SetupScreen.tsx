import type { LoadedGame } from '../legacy/engine/gameLoader';
import { getEligiblePoolTotal } from '../legacy/engine/gameplayShell';
import type { GameSession } from '../legacy/types/session';
import type { SessionSettings } from '../legacy/engine/sessionManager';
import CategorySelector from '../components/CategorySelector';
import IntensitySelector from '../components/IntensitySelector';
import { getLengthTarget, validPlayerCount } from '../engine/sessionLength';
import SessionLengthSelector from '../components/SessionLengthSelector';
import { usesFullMix } from '../engine/modeFilters';
import { intensityLabels } from '../components/intensityLabels';
import PlayerSetup from '../components/PlayerSetup';

export default function SetupScreen({ game, session, error, onChange, onStart, onHome }: {
  game: LoadedGame; session: GameSession; error: string | null;
  onChange: (settings: Partial<SessionSettings>) => void; onStart: () => void; onHome: () => void;
}) {
  const { manifest } = game;
  const fullMix = usesFullMix(session, game);
  const playerCount = validPlayerCount(session.players);
  const total = getEligiblePoolTotal(session, game);
  const target = getLengthTarget(session.sessionLengthMode ?? 'standard', playerCount, total).effective;
  return <>
    <p className="eyebrow">{manifest.name}</p><h1>Choose your vibe.</h1><p className="screen-intro">A little lighthearted. A little bold. Make it yours.</p>
    <form onSubmit={event => { event.preventDefault(); onStart(); }}>
      <fieldset className="choices mode-choices"><legend>Mode</legend>
        {manifest.modes.map(mode => <label className="choice" key={mode.id}><input type="radio" name="mode" checked={session.modeId === mode.id} onChange={() => onChange({ modeId: mode.id })} /><span><strong>{mode.label}</strong>{mode.description && <small>{mode.description}</small>}</span></label>)}
      </fieldset>
      {!fullMix && <><CategorySelector categories={manifest.categories} selected={session.selectedCategoryIds}
        onChange={selectedCategoryIds => onChange({ selectedCategoryIds })} />
      {manifest.intensityEnabled && <IntensitySelector levels={manifest.allowedIntensities ?? []}
        selected={session.selectedIntensities} onChange={selectedIntensities => onChange({ selectedIntensities })} />}</>}
      <div className="screen-intro" aria-live="polite" aria-atomic="true">
        {fullMix && <><p>All {manifest.categories.length} categories</p><p>{(manifest.allowedIntensities ?? []).map(level => intensityLabels[level]).join(' · ')}</p></>}
        <p>{total} cards available in this {fullMix ? 'mix' : 'vibe'}</p>
        {total > 0 && total < 5 && <p>Only {total} cards match this vibe. Add another category or intensity for a longer game.</p>}
      </div>
      <PlayerSetup players={session.players} onChange={players => onChange({ players })} />
      {playerCount > 0 && <SessionLengthSelector selected={session.sessionLengthMode ?? 'standard'}
        playerCount={playerCount} eligibleCount={total} onChange={sessionLengthMode => onChange({ sessionLengthMode })} />}
      {error && <p role="alert">{error}</p>}
      <div className="buttons"><button className="button-primary setup-start" type="submit" disabled={Boolean(error) || total === 0}>{playerCount > 0 ? `START GAME · ${target} CARDS` : 'START GAME'}</button>
        <button className="button-quiet" type="button" onClick={onHome}>Back to Home</button></div>
    </form>
  </>;
}
