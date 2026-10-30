import { useEffect, useRef, useState } from 'react';
import { loadDefaultGame } from './data/defaultGame';
import { themeStyle } from './theme/themeStyle';
import warmTheme from './data/themes/date-night-warm.json';
import { loadTheme } from './engine/gameLoader';
import type { LoadedGame } from './engine/gameLoader';
import { createGameplayController } from './engine/gameplayController';
import type { GameplayResult } from './engine/gameplayController';
import { getProgress, hasReveal } from './engine/sessionActions';
import type { SessionAction } from './engine/sessionActions';
import { createLocalStorageAdapter } from './storage/localStorageAdapter';
import { STAGES, presentItem } from './components/dateNightPresentation';
import DateNightSetup from './components/DateNightSetup';
import { vibeStyle } from './theme/vibeTokens';
import './date-night.css';
const dateNightTheme = loadTheme(warmTheme);

function DateNight({ game }: { game: LoadedGame }) {
  const [controller] = useState(() => createGameplayController(game, createLocalStorageAdapter(game)));
  const [state, setState] = useState(controller.getState);
  const [configuration, setConfiguration] = useState(state.configuration);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [endRevision, setEndRevision] = useState<number | null>(null);
  const [unavailableSwap, setUnavailableSwap] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const revealed = useRef<HTMLDivElement>(null);
  const endButton = useRef<HTMLButtonElement>(null);
  const keepPlaying = useRef<HTMLButtonElement>(null);
  const notice = useRef<HTMLParagraphElement>(null);
  const focusIntent = useRef<'heading' | 'reveal' | 'end'>('heading');
  const { session } = state;
  const activeVibe = state.screen === 'home' ? undefined : state.screen === 'setup' ? configuration.vibe : session?.configuration.vibe;
  const entry = session?.queue[session.currentSlot];
  const current = entry ? game.cards.find(card => card.id === entry.itemId) : null;
  const itemKey = session && current ? session.id + ':' + current.id : '';
  const stage = entry ? STAGES[entry.slot] : null;
  const content = current && entry ? presentItem(current, entry.slot) : null;
  const progress = session ? getProgress(session) : null;
  useEffect(() => {
    if (endRevision !== null) { keepPlaying.current?.focus(); return; }
    if (focusIntent.current === 'end') endButton.current?.focus();
    else if (focusIntent.current === 'reveal') revealed.current?.focus();
    else heading.current?.focus();
    focusIntent.current = 'heading';
  }, [state.revision, endRevision]);
  useEffect(() => { if (error) notice.current?.focus(); }, [error]);
  function accept(result: GameplayResult, action = 'navigate') {
    if (!result.ok) {
      if (result.reason === 'stale_action') return;
      if (result.reason === 'no_replacement') setUnavailableSwap(itemKey);
      const message = result.reason === 'storage_unavailable' ? 'We couldn’t save that change. Your previous activity is still here. Please try again.'
        : result.reason === 'no_replacement' ? 'No more swaps available for this activity.'
        : result.reason === 'reveal_unavailable' ? 'There’s nothing to reveal for this activity.'
        : 'We couldn’t build this date. Try another combination.';
      setError(message); setAnnouncement(''); return;
    }
    const next = result.state.session;
    focusIntent.current = action === 'reveal' ? 'reveal' : 'heading';
    if (next?.status === 'playing') {
      const label = STAGES[next.queue[next.currentSlot]!.slot].label;
      setAnnouncement(action === 'reveal' ? 'Your reveal is ready.' : (action === 'swap' ? 'A new activity is shown. ' : '') +
        label + '. Activity ' + (next.currentSlot + 1) + ' of 5.');
    } else setAnnouncement('');
    setState(result.state); setConfiguration(result.state.configuration); setEndRevision(null); setError(null);
  }
  function perform(action: SessionAction) { accept(controller.perform(action, state.revision), action.type); }
  function cancelEnd() { focusIntent.current = 'end'; setEndRevision(null); }
  return <main className={'date-night dn-screen-' + state.screen} style={{ ...themeStyle(dateNightTheme), ...(activeVibe ? vibeStyle(activeVibe) : {}) }} data-theme={warmTheme.id}
    data-vibe={activeVibe} data-ended-reason={state.screen === 'ended' ? session?.endedReason : undefined}
    onKeyDown={event => { if (event.key === 'Escape' && endRevision !== null) { event.preventDefault(); cancelEnd(); } }}>
    <header className="dn-brand"><span className="dn-mark" aria-hidden="true">◒</span><span>DATE NIGHT</span><span className="dn-preview">72 activities</span></header>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    {error && <p className="dn-notice" role="status" aria-live="polite" aria-atomic="true" ref={notice} tabIndex={-1}>{error}</p>}
    {state.screen === 'home' && <section className="dn-home" aria-labelledby="home-heading">
      <div className="dn-home-copy"><p className="dn-eyebrow">A LITTLE TIME. JUST THE TWO OF YOU.</p>
        <h1 id="home-heading" ref={heading} tabIndex={-1}>Stop planning.<br /><em>Start your date.</em></h1>
        <p className="dn-lead">One guided date night.<br />Five activities. Zero planning.</p>
        <p className="dn-intro">Choose your vibe, your time, and your intensity.<br />We build the night for you.</p>
        <button className="dn-primary dn-home-cta" onClick={() => accept(controller.changeVibe(state.revision))}>BUILD YOUR DATE <span aria-hidden="true">↗</span></button>
        <p className="dn-support">5 guided activities <span aria-hidden="true">•</span> 1 phone <span aria-hidden="true">•</span> 2 people</p>
      </div><div className="dn-recipe" aria-label="Your five-part date"><p className="dn-eyebrow">YOUR NIGHT, TAKEN CARE OF</p>
        {Object.entries(STAGES).map(([key, value]) => <div className="dn-recipe-step" key={key}><span>{value.symbol}</span><div><strong>{value.label}</strong><p>{value.subtitle}</p></div></div>)}
      </div>
    </section>}
    {state.screen === 'setup' && <DateNightSetup value={configuration} onChange={setConfiguration} headingRef={heading}
      onStart={() => accept(controller.start(configuration, state.revision))} onHome={() => accept(controller.home(state.revision))} />}
    {state.screen === 'playing' && session && stage && entry && current && content && progress && <section className="dn-play" data-stage={entry.slot} aria-labelledby="activity-heading">
      <div className="dn-activity-header"><div><p className="dn-eyebrow">{stage.label}</p><h1 ref={heading} tabIndex={-1} id="activity-heading">{stage.subtitle}</h1></div><span className="dn-ordinal">Activity {progress.ordinal} of 5</span></div>
      <div className="dn-progress" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <span key={i} data-completed={i < session.currentSlot} data-current={i === session.currentSlot} />)}</div>
      <article className="dn-card" aria-label="Current activity"><p className="dn-card-guide">{stage.description}</p><h2>{content.prompt}</h2>
        {hasReveal(game, session) && session.revealState === 'revealed' && <div className="dn-reveal" ref={revealed} tabIndex={-1} role="region" aria-label="Your reveal"><p className="dn-eyebrow">THE REVEAL</p><p>{content.reveal}</p></div>}
      </article>
      <div className="dn-action-row">
        {hasReveal(game, session) && <button className="dn-secondary" disabled={endRevision !== null || session.revealState === 'revealed'} onClick={() => perform({ type: 'reveal' })}>{session.revealState === 'revealed' ? 'REVEALED' : 'REVEAL'}</button>}
        <button className="dn-primary dn-done" disabled={endRevision !== null} onClick={() => perform({ type: 'done' })}>DONE <span aria-hidden="true">→</span></button>
      </div>
      <div className="dn-swap-row"><p>Not feeling this one?<br /><span>Swap it for another activity.</span></p>
        <button className="dn-secondary" disabled={endRevision !== null || unavailableSwap === itemKey} onClick={() => perform({ type: 'swap' })}>{unavailableSwap === itemKey ? 'NO MORE SWAPS' : 'SWAP'}</button></div>
      <div className="dn-end-row"><button className="dn-text-button" ref={endButton} disabled={endRevision !== null} onClick={() => setEndRevision(state.revision)}>End date</button><span>Go at your own pace.</span></div>
      {endRevision !== null && <div className="dn-confirm" role="alertdialog" aria-modal="false" aria-labelledby="end-question" aria-describedby="end-description">
        <h2 id="end-question">End this date?</h2><p id="end-description">You can stop here, but your progress will be saved as ended.</p>
        <div className="dn-action-row"><button className="dn-primary" ref={keepPlaying} onClick={cancelEnd}>KEEP PLAYING</button><button className="dn-danger" onClick={() => accept(controller.perform({ type: 'end', confirmed: true }, endRevision))}>END DATE</button></div>
      </div>}
    </section>}
    {state.screen === 'ended' && session && <section className="dn-result" aria-labelledby="result-heading">
      <span className="dn-result-mark" aria-hidden="true">{session.endedReason === 'completed' ? '✧' : '◒'}</span>
      <p className="dn-eyebrow">TIME WELL SPENT, TOGETHER</p><h1 id="result-heading" ref={heading} tabIndex={-1}>{session.endedReason === 'completed' ? 'Your date is complete' : 'Date ended'}</h1>
      <p className="dn-lead">{session.endedReason === 'completed' ? 'You made it through all five activities.' : 'You stopped this date early.'}</p>
      <p className="dn-intro">{session.endedReason === 'completed' ? 'Save the moment. Do another one anytime.' : 'There’s always another night. Pick up with a fresh date whenever you like.'}</p>
      <div className="dn-result-actions"><button className="dn-primary" onClick={() => accept(controller.newDate(state.revision))}>NEW DATE <span aria-hidden="true">↗</span></button><button className="dn-secondary" onClick={() => accept(controller.changeVibe(state.revision))}>CHANGE VIBE</button><button className="dn-text-button" onClick={() => accept(controller.home(state.revision))}>HOME</button></div>
    </section>}
    <footer className="dn-footer"><span>Made for a little more us.</span><span>Made for two</span></footer>
  </main>;
}
export default function App() {
  const [result] = useState(() => {
    try { return { game: loadDefaultGame(), error: null }; }
    catch (error) { return { game: null, error: error instanceof Error ? error.message : 'Unable to load your date.' }; }
  });
  return result.game ? <DateNight game={result.game} /> : <main><h1>Unable to load your date</h1><p role="alert">{result.error}</p></main>;
}
