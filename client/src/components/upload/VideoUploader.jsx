import { useRef, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";

function formatBytes(value = 0) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** exponent;
  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export default function VideoUploader({ file, previewUrl, onSelect }) {
  const inputRef = useRef(null);
  const [isDragging, setDragging] = useState(false);

  function selectFile(nextFile) {
    if (nextFile) onSelect(nextFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section
      className={[
        "upload-dropzone studio-video-uploader",
        file ? "has-file" : "",
        isDragging ? "drag-active" : ""
      ].filter(Boolean).join(" ")}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        accept="video/*"
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
      {file ? (
        <div className="studio-selected-file">
          <span className="studio-mini-icon">
            <YoutubeIcon name="yourVideos" size={22} />
          </span>
          <span>
            <strong>{file.name}</strong>
            <small>{formatBytes(file.size)}</small>
          </span>
        </div>
      ) : (
        <div className="upload-dropzone-empty studio-upload-empty">
          <span className="studio-upload-icon">
            <YoutubeIcon name="upload" size={34} />
          </span>
          <strong>Upload videos</strong>
          <span>MP4, WebM, MOV, MKV</span>
        </div>
      )}
      <div className="studio-file-actions">
        <button className={file ? "button studio-secondary-button" : "auth-primary-button"} onClick={() => inputRef.current?.click()} type="button">
          <YoutubeIcon name={file ? "yourVideos" : "upload"} size={18} />
          {file ? "Change video" : "Select file"}
        </button>
      </div>
    </section>
  );
}
