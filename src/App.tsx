import { useState } from 'react';
import { loadDefaultGame } from './data/defaultGame';
import HomeScreen from './screens/HomeScreen';
import { themeStyle } from './theme/themeStyle';
import type { LoadedGame } from './engine/gameLoader';
import { getQueueDuration } from './engine/sessionComposer';
import { restoreDateNight, startDateNight } from './engine/sessionStart';
import { createLocalStorageAdapter } from './storage/localStorageAdapter';
import { INTENSITIES, SESSION_DURATIONS, VIBES } from './types/game';
import type { DateNightConfiguration } from './types/game';

function DateNightPreview({ game }: { game: LoadedGame }) {
  const [storage] = useState(() => createLocalStorageAdapter(game));
  const [session, setSession] = useState(() => restoreDateNight(game, storage));
  const [configuration, setConfiguration] = useState<DateNightConfiguration>(() =>
    session?.configuration ?? { vibe: 'cozy', durationMinutes: 15, intensityCeiling: 'sweet' });
  const [error, setError] = useState<string | null>(null);
  function start() {
    const result = startDateNight(game, configuration, storage);
    if (!result.ok) {
      setError(result.reason === 'storage_unavailable' ? 'Could not save the session. Check browser storage and try again.'
        : 'No complete session is available for this configuration.');
      return;
    }
    setError(null);
    setSession(result.session);
  }
  const isPlaying = session?.status === 'playing';
  const current = isPlaying ? game.cards.find(card => card.id === session.queue[session.currentSlot]!.itemId) : null;
  return <main className={`app-shell screen-${isPlaying ? 'playing' : 'home'}`} data-theme={game.theme.id}
    style={themeStyle(game.theme)}>
    {error && <p role="alert">{error}</p>}
    {session && current ? <section aria-label="Session preview">
      <p>{session.queue[session.currentSlot]!.slot} · {session.currentSlot + 1} / 5</p>
      <p>Planned duration: {getQueueDuration(session.queue, game)} minutes</p>
      <article className="game-card" aria-label="Current card"><p className="prompt">{current.text}</p></article>
    </section> : <>
      <fieldset><legend>Infrastructure preview configuration</legend>
        <label>Vibe <select value={configuration.vibe} onChange={event =>
          setConfiguration({ ...configuration, vibe: event.target.value as DateNightConfiguration['vibe'] })}>
          {VIBES.map(vibe => <option key={vibe}>{vibe}</option>)}
        </select></label>
        <label>Minutes <select value={configuration.durationMinutes} onChange={event =>
          setConfiguration({ ...configuration, durationMinutes: Number(event.target.value) as 15 | 30 })}>
          {SESSION_DURATIONS.map(duration => <option key={duration}>{duration}</option>)}
        </select></label>
        <label>Intensity ceiling <select value={configuration.intensityCeiling} onChange={event =>
          setConfiguration({ ...configuration, intensityCeiling: event.target.value as DateNightConfiguration['intensityCeiling'] })}>
          {INTENSITIES.map(intensity => <option key={intensity}>{intensity}</option>)}
        </select></label>
      </fieldset>
      <HomeScreen manifest={game.manifest} onStart={start} />
    </>}
  </main>;
}

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

  return result.game ? <DateNightPreview game={result.game} />
    : <main><h1>Unable to load game</h1><p role="alert">{result.error}</p></main>;
}
