export default function VideoControls({ autoplay, onAutoplayChange, quality, onQualityChange }) {
  return (
    <div className="video-controls">
      <label>
        <input
          type="checkbox"
          checked={Boolean(autoplay)}
          onChange={(event) => onAutoplayChange?.(event.target.checked)}
        />
        Autoplay
      </label>
      <label>
        Quality
        <select value={quality || "auto"} onChange={(event) => onQualityChange?.(event.target.value)}>
          <option value="auto">Auto</option>
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="360p">360p</option>
        </select>
      </label>
    </div>
  );
}
