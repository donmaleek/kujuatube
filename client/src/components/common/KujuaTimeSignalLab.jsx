import YoutubeIcon from "./YoutubeIcon.jsx";

const intentOptions = [
  { id: "learn", label: "Learn" },
  { id: "create", label: "Create" },
  { id: "relax", label: "Relax" }
];

export default function KujuaTimeSignalLab({ preferences, onChange, onReset, stats }) {
  return (
    <section className="signal-lab" aria-label="KujuaTime Signal Lab">
      <div className="signal-lab-summary">
        <span className="pulse-badge signal-lab-badge">
          <YoutubeIcon name="sparkle" size={17} />
          Signal Lab
        </span>
        <h2>Your algorithm, visible</h2>
        <p>
          {stats.region} feed · {stats.videoCount} videos · {stats.creatorCount} creators · {preferences.sessionMinutes} min session
        </p>
        <div className="signal-lab-toggles">
          <label>
            <input
              checked={preferences.calmMode}
              onChange={(event) => onChange("calmMode", event.target.checked)}
              type="checkbox"
            />
            Calm mode
          </label>
          <label>
            <input
              checked={preferences.trustMode}
              onChange={(event) => onChange("trustMode", event.target.checked)}
              type="checkbox"
            />
            Trust-first
          </label>
        </div>
      </div>

      <div className="signal-lab-controls">
        <div className="segmented-control" role="group" aria-label="Feed intent">
          {intentOptions.map((option) => (
            <button
              className={preferences.intent === option.id ? "active" : ""}
              key={option.id}
              onClick={() => onChange("intent", option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="signal-slider">
          <span>
            Local first <strong>{preferences.localFirst}%</strong>
          </span>
          <input
            max="100"
            min="0"
            onChange={(event) => onChange("localFirst", Number(event.target.value))}
            type="range"
            value={preferences.localFirst}
          />
        </label>

        <label className="signal-slider">
          <span>
            New creator lift <strong>{preferences.newCreators}%</strong>
          </span>
          <input
            max="100"
            min="0"
            onChange={(event) => onChange("newCreators", Number(event.target.value))}
            type="range"
            value={preferences.newCreators}
          />
        </label>

        <label className="signal-slider compact">
          <span>
            Session <strong>{preferences.sessionMinutes} min</strong>
          </span>
          <input
            max="60"
            min="5"
            onChange={(event) => onChange("sessionMinutes", Number(event.target.value))}
            step="1"
            type="range"
            value={preferences.sessionMinutes}
          />
        </label>

        <button className="signal-reset-button" onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </section>
  );
}
