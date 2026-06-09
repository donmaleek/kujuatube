import { useEffect, useRef, useState } from "react";
import ThumbnailUploader from "../components/upload/ThumbnailUploader.jsx";
import UploadProgress from "../components/upload/UploadProgress.jsx";
import VideoDetailsForm from "../components/upload/VideoDetailsForm.jsx";
import VideoUploader from "../components/upload/VideoUploader.jsx";
import YoutubeIcon from "../components/common/YoutubeIcon.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { uploadVideo } from "../services/uploadService.js";

const initialValues = {
  title: "",
  description: "",
  category: "Education",
  visibility: "public",
  duration: "0:00",
  videoUrl: "",
  thumbnailUrl: "",
  videoFile: null,
  thumbnailFile: null
};

function formatDuration(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  if (hours) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function titleFromFilename(name = "") {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function formatBytes(value = 0) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** exponent;
  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getStepStatus(step, values, progress, publishedVideo) {
  if (publishedVideo) return "complete";
  if (step === "Upload") return values.videoFile ? "complete" : "active";
  if (step === "Details") {
    if (!values.videoFile) return "pending";
    return values.title.trim() ? "complete" : "active";
  }
  if (step === "Checks") {
    if (!values.videoFile || !values.title.trim()) return "pending";
    return "complete";
  }
  if (!values.videoFile || !values.title.trim()) return "pending";
  return progress > 0 ? "complete" : "active";
}

export default function Upload() {
  const { user } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [publishedVideo, setPublishedVideo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const videoObjectUrl = useRef("");
  const thumbnailObjectUrl = useRef("");

  function revokeObjectUrl(ref) {
    if (!ref.current) return;
    URL.revokeObjectURL(ref.current);
    ref.current = "";
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl(videoObjectUrl);
      revokeObjectUrl(thumbnailObjectUrl);
    };
  }, []);

  function selectVideoFile(file) {
    if (!file) return;
    revokeObjectUrl(videoObjectUrl);
    const previewUrl = URL.createObjectURL(file);
    videoObjectUrl.current = previewUrl;
    setVideoPreviewUrl(previewUrl);
    setError("");
    setPublishedVideo(null);
    setValues((current) => ({
      ...current,
      videoFile: file,
      title: current.title || titleFromFilename(file.name),
      duration: "0:00"
    }));

    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = previewUrl;
    probe.onloadedmetadata = () => {
      setValues((current) => (current.videoFile === file ? { ...current, duration: formatDuration(probe.duration) } : current));
    };
  }

  function selectThumbnailFile(file) {
    if (!file) return;
    revokeObjectUrl(thumbnailObjectUrl);
    const previewUrl = URL.createObjectURL(file);
    thumbnailObjectUrl.current = previewUrl;
    setThumbnailPreviewUrl(previewUrl);
    setValues((current) => ({ ...current, thumbnailFile: file }));
  }

  function resetForm() {
    revokeObjectUrl(videoObjectUrl);
    revokeObjectUrl(thumbnailObjectUrl);
    setVideoPreviewUrl("");
    setThumbnailPreviewUrl("");
    setValues(initialValues);
    setProgress(0);
  }

  async function submit(event) {
    event.preventDefault();
    if (!values.videoFile) {
      setError("Choose a video file from your computer before publishing.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setPublishedVideo(null);

    try {
      const created = await uploadVideo(values, setProgress);
      setMessage(`Published "${created.title}"`);
      setPublishedVideo(created);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <section className="empty-state studio-upload-gate">
        <span className="studio-upload-icon">
          <YoutubeIcon name="upload" size={34} />
        </span>
        <h1>Sign in to upload</h1>
        <div className="empty-actions">
          <a className="button primary" href="/signup?next=%2Fupload">Create account</a>
          <a className="button" href="/login?next=%2Fupload">Sign in</a>
        </div>
      </section>
    );
  }

  return (
    <form className={values.videoFile ? "upload-page studio-upload-page has-video" : "upload-page studio-upload-page"} onSubmit={submit}>
      <header className="studio-upload-header">
        <div>
          <span>KujuaTime Studio</span>
          <h1>Upload videos</h1>
        </div>
        <a className="button ghost" href="/profile">
          <YoutubeIcon name="you" size={18} />
          Channel
        </a>
      </header>

      <section className="studio-upload-shell">
        <div className="studio-upload-main">
          <nav className="studio-upload-steps" aria-label="Upload progress">
            {["Upload", "Details", "Checks", "Visibility"].map((step) => (
              <span className={getStepStatus(step, values, progress, publishedVideo)} key={step}>
                {step}
              </span>
            ))}
          </nav>

          <VideoUploader file={values.videoFile} previewUrl={videoPreviewUrl} onSelect={selectVideoFile} />

          {values.videoFile ? (
            <>
              <VideoDetailsForm values={values} onChange={setValues} />
              <section className="studio-checks-panel">
                <header className="studio-section-heading">
                  <h2>Checks</h2>
                  <span>{values.videoFile ? "Complete" : "Pending"}</span>
                </header>
                <div className="studio-check-list">
                  <article>
                    <YoutubeIcon name="admin" size={20} />
                    <span>
                      <strong>Format</strong>
                      <small>{values.videoFile.type || "video file"}</small>
                    </span>
                  </article>
                  <article>
                    <YoutubeIcon name="watchLater" size={20} />
                    <span>
                      <strong>Duration</strong>
                      <small>{values.duration}</small>
                    </span>
                  </article>
                  <article>
                    <YoutubeIcon name="sparkle" size={20} />
                    <span>
                      <strong>Ready</strong>
                      <small>{values.visibility}</small>
                    </span>
                  </article>
                </div>
              </section>
            </>
          ) : null}
        </div>

        <aside className="studio-upload-side">
          <section className="studio-preview-card">
            <div className="studio-preview-player">
              {videoPreviewUrl ? (
                <video controls muted playsInline src={videoPreviewUrl} />
              ) : (
                <span>
                  <YoutubeIcon name="play" size={34} />
                </span>
              )}
            </div>
            <div className="studio-preview-meta">
              <small>Filename</small>
              <strong>{values.videoFile?.name || "No file selected"}</strong>
              <span>{values.videoFile ? `${formatBytes(values.videoFile.size)} · ${values.duration}` : "Draft"}</span>
            </div>
          </section>

          <ThumbnailUploader file={values.thumbnailFile} previewUrl={thumbnailPreviewUrl} onSelect={selectThumbnailFile} />

          <section className="studio-audience-panel">
            <h2>Audience</h2>
            <label className="studio-checkbox-row">
              <input type="checkbox" checked readOnly />
              <span>Made for a general audience</span>
            </label>
          </section>
        </aside>
      </section>

      <footer className="studio-publish-bar">
        <div className="studio-publish-status">
          <strong>{saving ? `Uploading ${progress}%` : publishedVideo ? "Published" : values.videoFile ? "Ready to publish" : "Waiting for video"}</strong>
          <UploadProgress value={saving || progress ? progress : values.videoFile ? 100 : 0} />
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
        </div>
        <div className="upload-actions">
          {publishedVideo ? (
            <a className="button" href={`/watch?id=${publishedVideo.id}`}>
              <YoutubeIcon name="play" size={18} />
              View video
            </a>
          ) : null}
          <button className="auth-primary-button" disabled={saving || !values.videoFile || !values.title.trim()}>
            {saving ? "Publishing" : "Publish"}
          </button>
        </div>
      </footer>
    </form>
  );
}
