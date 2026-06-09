export default function UploadProgress({ value = 0 }) {
  const progress = Math.min(100, Math.max(0, value));

  return (
    <div className="progress studio-progress" aria-label="Upload progress" aria-valuemax="100" aria-valuemin="0" aria-valuenow={progress} role="progressbar">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}
