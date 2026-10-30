import type { Card } from '../legacy/types/card';
import MediaRenderer from './MediaRenderer';
import { intensityLabels } from './intensityLabels';
import CategoryIcon from './CategoryIcon';

export default function GameCard({ card, category }: { card: Card; category: string }) {
  const tier = card.text.length <= 65 ? 'short' : card.text.length <= 100 ? 'standard' : 'long';
  return <article className={`game-card prompt-${tier}`} data-category={card.categoryId} aria-label="Current card">
    <p className="card-meta"><CategoryIcon categoryId={card.categoryId} />{category}<span aria-hidden="true"> · </span><span className="intensity-label">{intensityLabels[card.intensity]}</span></p>
    {card.media?.length ? <MediaRenderer assets={card.media} /> : null}
    <p className="prompt">{card.text}</p>
  </article>;
}
