import { useId, useState } from 'react';
import type { Player } from '../types/session';
import { createId } from '../utils/createId';

export default function PlayerSetup({ players, onChange }: {
  players: Player[]; onChange: (players: Player[]) => void;
}) {
  const id = useId();
  const [text, setText] = useState(players.map(player => player.name).join('\n'));
  return <>
    <label htmlFor={id}>Player names (optional, one per line)</label>
    <p className="player-helper" id={`${id}-help`}>Add names for player turns and game length.</p>
    <textarea id={id} aria-describedby={`${id}-help`} rows={3} value={text} onChange={event => {
      setText(event.target.value);
      onChange(event.target.value.split('\n').map(name => name.trim()).filter(Boolean)
        .map((name, index) => ({ id: players[index]?.id ?? createId(), name })));
    }} />
  </>;
}
