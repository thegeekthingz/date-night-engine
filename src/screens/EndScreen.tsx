import { getNightHighlights } from '../engine/nightHighlights';
import type { GameSession } from '../legacy/types/session';

export default function EndScreen({ session, playedCount, onAgain, onSetup, onHome }: {
  session?: GameSession; playedCount?: number; onAgain: () => void; onSetup: () => void; onHome: () => void;
}) {
  const actualPlayed = session?.consumedCardCount ?? playedCount ?? session?.playedCardIds.length ?? 0;
  const stats = session?.playerStats ?? {};
  const highlights = session?.players.length ? getNightHighlights(session.players, stats) : [];
  return <section className="end-screen">
    <p className="eyebrow">Game Over</p>
    <h1 className="brand-title">That was juicy.</h1>
    <p className="end-count"><strong>{actualPlayed}</strong> cards played</p>
    {session?.players.length ? <div className="player-results" aria-label="Player session stats">
      {session.players.map(player => {
        const result = stats[player.id] ?? { spillCount: 0, sipCount: 0, skipCount: 0 };
        return <div className="player-result" key={player.id}><strong>{player.name}</strong>
          <span>{result.spillCount} Spill · {result.sipCount} Sip · {result.skipCount} Skip</span></div>;
      })}
    </div> : null}
    {highlights.length ? <section className="night-highlights" aria-labelledby="night-highlights-title">
      <h2 id="night-highlights-title">Night Highlights <span aria-hidden="true">✨</span></h2>
      {highlights.map(item => <p key={item.metric}>{item.text}</p>)}
    </section> : null}
    <div className="buttons stacked"><button className="button-primary" onClick={onAgain}>Play Again</button>
      <button onClick={onSetup}>Change Vibe</button><button className="button-quiet" onClick={onHome}>Back to Home</button></div>
  </section>;
}
