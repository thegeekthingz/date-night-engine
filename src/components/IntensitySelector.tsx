import type { IntensityLevel } from '../types/game';
import { intensityLabels } from './intensityLabels';

const descriptions = { mild: 'Keep it light', spicy: 'Turn up the heat', wild: 'No limits' };

export default function IntensitySelector({ levels, selected, onChange }: {
  levels: IntensityLevel[]; selected: IntensityLevel[]; onChange: (levels: IntensityLevel[]) => void;
}) {
  return <fieldset className="choices intensity-choices"><legend>Intensity</legend>{levels.map(level =>
    <label className="choice" key={level}>
      <input type="checkbox" checked={selected.includes(level)} onChange={event =>
        onChange(event.target.checked ? [...selected, level] : selected.filter(item => item !== level))} />
      <span><strong className="intensity-label">{intensityLabels[level]}</strong><small>{descriptions[level]}</small></span>
    </label>,
  )}</fieldset>;
}
