type HomeManifest = { name: string; edition?: string; adultContent?: boolean; ageNotice?: string };

export default function HomeScreen({ manifest, onStart }: { manifest: HomeManifest; onStart?: () => void }) {
  return <section className="welcome">
    <span className="brand-motif" aria-hidden="true">♡</span>
    <p className="eyebrow">A night worth talking about</p>
    <h1 className="brand-title">{manifest.name}</h1>
    {manifest.edition && <p className="edition">{manifest.edition}</p>}
    <div className="welcome-copy"><h2>Secrets. Stories. Chaos.</h2>
      <p>How honest are you feeling tonight?</p></div>
    <button className="button-primary start-button" disabled={!onStart}
      title={!onStart ? 'Start is unavailable in this preview.' : undefined}
      onClick={onStart}>Start Game <span aria-hidden="true">↗</span></button>
    {manifest.adultContent && manifest.ageNotice && <p className="age-notice">{manifest.ageNotice}</p>}
  </section>;
}
