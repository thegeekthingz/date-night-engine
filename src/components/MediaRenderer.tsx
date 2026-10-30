import { useState } from 'react';
import type { MediaAsset } from '../legacy/types/card';

function MediaItem({ asset }: { asset: MediaAsset }) {
  const [failed, setFailed] = useState(false);
  if (failed || !asset.src?.trim() || !['image', 'gif', 'video'].includes(asset.type)) {
    return <p role="status">Media unavailable. You can continue with the prompt.</p>;
  }
  return asset.type === 'video'
    ? <video controls muted playsInline preload="none" poster={asset.poster} aria-label={asset.alt ?? 'Card video'}
        onError={() => setFailed(true)} src={asset.src}>
        Your browser cannot play this video. You can continue with the prompt.
      </video>
    : <img loading="lazy" decoding="async" src={asset.src} alt={asset.alt ?? ''} onError={() => setFailed(true)} />;
}

export default function MediaRenderer({ assets = [] }: { assets?: MediaAsset[] }) {
  if (!assets.length) return null;
  return <div className="media">{assets.map(asset =>
    <MediaItem key={`${asset.id}:${asset.type}:${asset.src}`} asset={asset} />,
  )}</div>;
}
