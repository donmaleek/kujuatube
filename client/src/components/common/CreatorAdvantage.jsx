import YoutubeIcon from "./YoutubeIcon.jsx";

const creatorAdvantages = [
  {
    icon: "sparkle",
    label: "Open algorithm",
    value: "Explain every boost",
    detail: "Creators see which signals helped a video move: retention, trust, local fit, saves, and new-creator lift."
  },
  {
    icon: "save",
    label: "Portable audience",
    value: "Own the relationship",
    detail: "Channels are designed around subscriber exports, member lists, and community ownership instead of lock-in."
  },
  {
    icon: "transcript",
    label: "World-ready videos",
    value: "Captions first",
    detail: "Every upload is treated as a global asset with captions, transcripts, summaries, and translation hooks."
  },
  {
    icon: "watchLater",
    label: "Healthy sessions",
    value: "No dark loops",
    detail: "KujuaTime recommends stopping points, goal-based feeds, and calm mode so users leave better than they arrived."
  }
];

export default function CreatorAdvantage({ region }) {
  return (
    <section className="creator-advantage" aria-label="Why creators choose KujuaTime">
      <div className="creator-advantage-intro">
        <span className="pulse-badge signal-lab-badge">
          <YoutubeIcon name="premium" size={17} />
          Creator-first · {region}
        </span>
        <h2>The platform creators ask for when they are tired of guessing</h2>
        <p>
          KujuaTime is built around visible rules, portable community, multilingual reach, and viewer respect.
        </p>
      </div>
      <div className="creator-advantage-grid">
        {creatorAdvantages.map((item) => (
          <article key={item.label}>
            <YoutubeIcon name={item.icon} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
