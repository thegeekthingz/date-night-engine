import type { DateNightConfiguration } from '../types/game';
import { vibeStyle } from '../theme/vibeTokens';
const vibes = [ ['cozy', 'Cozy', 'Slow down. Settle in.'], ['funny', 'Funny', 'Less serious. More smiles.'],
  ['romantic', 'Romantic', 'Make a little space for us.'], ['competitive', 'Competitive', 'A friendly spark of rivalry.'] ] as const;
export default function DateNightSetup({ value, onChange, onStart, onHome, headingRef }: {
  value: DateNightConfiguration; onChange: (value: DateNightConfiguration) => void; onStart: () => void;
  onHome: () => void; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return <section className="dn-setup" aria-labelledby="setup-heading">
    <p className="dn-eyebrow">MAKE IT YOURS</p>
    <h1 id="setup-heading" ref={headingRef} tabIndex={-1}>What kind of night?</h1>
    <p className="dn-intro">Three little choices. We’ll take it from here.</p>
    <form onSubmit={event => { event.preventDefault(); onStart(); }}>
      <fieldset><legend><span>01</span> VIBE</legend><div className="dn-options dn-vibes">
        {vibes.map(([vibe, label, detail]) => <label className="dn-option" key={vibe} style={vibeStyle(vibe)} data-option-vibe={vibe}>
          <input type="radio" name="vibe" value={vibe} checked={value.vibe === vibe}
            onChange={() => onChange({ ...value, vibe })} />
          <span><strong>{label}</strong><small>{detail}</small></span>
        </label>)}
      </div></fieldset>
      <fieldset><legend><span>02</span> TIME</legend><div className="dn-options">
        {([15, 30] as const).map(minutes => <label className="dn-option" key={minutes}>
          <input type="radio" name="time" value={minutes} checked={value.durationMinutes === minutes}
            onChange={() => onChange({ ...value, durationMinutes: minutes })} />
          <span><strong>{minutes} min</strong><small>{minutes === 15 ? 'Quick Date' : 'Full Date'}</small></span>
        </label>)}
      </div><p className="dn-help">A little guidance, not a countdown. Go at your own pace.</p></fieldset>
      <fieldset><legend><span>03</span> INTENSITY</legend><div className="dn-options">
        {(['sweet', 'flirty'] as const).map(intensity => <label className="dn-option" key={intensity}>
          <input type="radio" name="intensity" value={intensity} checked={value.intensityCeiling === intensity}
            onChange={() => onChange({ ...value, intensityCeiling: intensity })} />
          <span><strong>{intensity === 'sweet' ? 'Sweet' : 'Flirty'}</strong>
            <small>{intensity === 'sweet' ? 'Warm, playful, easygoing' : 'A little bolder, still couple-friendly'}</small></span>
        </label>)}
      </div><p className="dn-help">Flirty includes Sweet activities, with room for a little more spark.</p></fieldset>
      <button className="dn-primary dn-wide" type="submit">BUILD MY DATE <span aria-hidden="true">↗</span></button>
      <button className="dn-text-button dn-wide" type="button" onClick={onHome}>Back to Home</button>
    </form>
  </section>;
}
