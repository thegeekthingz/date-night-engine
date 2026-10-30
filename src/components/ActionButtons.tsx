import type { ActionConfig } from '../types/game';

export default function ActionButtons({ actions, onAction, disabled = false }: {
  actions: ActionConfig[]; onAction: (id: string) => void; disabled?: boolean;
}) {
  return <div className="buttons primary-actions">{actions.map((action, index) =>
    <button className={index === 0 ? "button-primary" : "button-coral"} key={action.id} type="button" disabled={disabled} onClick={() => onAction(action.id)}>{action.label}</button>,
  )}</div>;
}
