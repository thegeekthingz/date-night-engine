import type { SessionLengthMode } from '../types/session';
import { getLengthTarget, SESSION_LENGTHS } from '../engine/sessionLength';

export default function SessionLengthSelector({ selected, playerCount, eligibleCount, onChange }: {
  selected: SessionLengthMode; playerCount: number; eligibleCount: number;
  onChange: (mode: SessionLengthMode) => void;
}) {
  const selectedTarget = getLengthTarget(selected, playerCount, eligibleCount).effective;
  return <fieldset className="choices length-choices"><legend>Game Length</legend>
    <p className="length-helper">Choose how long you want this session to be.</p>
    {SESSION_LENGTHS.map(preset => {
      const target = getLengthTarget(preset.id, playerCount, eligibleCount);
      return <label className="choice" key={preset.id}>
        <input type="radio" name="session-length" checked={selected === preset.id}
          onChange={() => onChange(preset.id)} />
        <span><strong>{preset.id === 'all' ? `ALL ${eligibleCount} CARDS` : preset.label}</strong><small>
          {preset.turns === null ? 'Play the full matching deck' :
            `${target.capped ? 'Up to ' : ''}${preset.turns} turns each · ${target.effective} cards${target.capped ? ' available' : ''}`}
        </small></span>
      </label>;
    })}
    <p className="length-summary" aria-live="polite" aria-atomic="true">
      {selectedTarget === eligibleCount
        ? `This session will use all ${eligibleCount} available cards.`
        : `This session will use ${selectedTarget} of ${eligibleCount} available cards.`}
    </p>
  </fieldset>;
}
