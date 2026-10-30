import { useEffect, useRef, useState } from 'react';
import { themeStyle } from '../theme/themeStyle';
import type { LoadedGame } from '../legacy/engine/gameLoader';
import type { GameSession } from '../legacy/types/session';
import { createLocalStorageAdapter } from '../legacy/storage/localStorageAdapter';
import { endSession, restartSession, updateSessionSettings } from '../legacy/engine/sessionManager';
import { consumeCard, createSetupSession, getPlayView, getSessionCardTotal, playAgain, restoreShellSession, setupError, startGame } from '../legacy/engine/gameplayShell';
import HomeScreen from '../screens/HomeScreen';
import SetupScreen from '../screens/SetupScreen';
import PlayScreen from '../screens/PlayScreen';
import EndScreen from '../screens/EndScreen';
import { useIdleHints } from './useIdleHints';

const storage = createLocalStorageAdapter();

export default function GameplayShell({ game }: { game: LoadedGame }) {
  const [session, setSession] = useState<GameSession | null>(() => restoreShellSession(game, storage.loadSession()));
  const [saved, setSaved] = useState(true);
  const main = useRef<HTMLElement>(null);
  const screen = session?.status ?? 'home';
  const hint = useIdleHints(`${session?.id ?? ''}:${session?.currentCardId ?? ''}`,
    session?.status === 'playing' && !getPlayView(session, game).exhausted);
  useEffect(() => { main.current?.focus(); }, [screen]);
  useEffect(() => {
    setSaved(session ? storage.saveSession(session) : storage.removeSession());
  }, [session]);

  return <main ref={main} tabIndex={-1} className={`app-shell screen-${screen}`} data-theme={game.theme.id} style={themeStyle(game.theme)}>
    {!saved && <p role="alert">Progress could not be saved. Refresh may restore older progress.</p>}
    {!session && <HomeScreen manifest={game.manifest} onStart={() => setSession(createSetupSession(game))} />}
    {session?.status === 'setup' && <SetupScreen key={session.id} game={game} session={session}
      error={setupError(session, game)} onChange={settings => setSession(updateSessionSettings(session, settings))}
      onStart={() => setSession(startGame(session, game))} onHome={() => setSession(null)} />}
    {session?.status === 'playing' && <PlayScreen hint={hint} manifest={game.manifest} view={getPlayView(session, game)}
      totalCards={getSessionCardTotal(session, game)} playedCount={session.playedCardIds.length}
      onNext={actionId => setSession(current => current
        ? consumeCard(current, game, actionId === 'spill' ? 'spill' : 'sip') : current)}
      onSkip={() => setSession(current => current ? consumeCard(current, game, 'skip') : current)}
      onEnd={() => setSession(endSession(session))} onRestart={() => setSession(playAgain(session, game))}
      onSetup={() => setSession(restartSession(session))} />}
    {session?.status === 'ended' && <EndScreen session={session}
      onAgain={() => setSession(playAgain(session, game))} onSetup={() => setSession(restartSession(session))}
      onHome={() => setSession(null)} />}
  </main>;
}
