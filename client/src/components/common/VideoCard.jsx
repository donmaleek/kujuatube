import { useRef, useState } from "react";
import { formatDate } from "../../utils/formatDate.js";
import { formatViews } from "../../utils/formatViews.js";

export default function VideoCard({ video, compact = false, reason = "" }) {
  const previewRef = useRef(null);
  const [previewing, setPreviewing] = useState(false);
  if (!video) return null;
  const hasPreviewVideo = Boolean(video.videoUrl);

  async function startPreview() {
    const previewNode = previewRef.current;
    if (!previewNode) return;

    // Lazy-load src on first hover — avoids 20 simultaneous metadata
    // requests flooding the network before the Watch page video loads.
    if (!previewNode.src || previewNode.src === window.location.href) {
      previewNode.src = video.videoUrl;
      previewNode.load();
    }

    previewNode.muted = true;
    setPreviewing(true);

    try {
      await previewNode.play();
    } catch {
      setPreviewing(false);
    }
  }

  function stopPreview() {
    setPreviewing(false);
    const previewNode = previewRef.current;
    if (!previewNode) return;
    previewNode.pause();
    previewNode.currentTime = 0;
  }

  return (
    <article className={[compact ? "video-card compact" : "video-card", previewing ? "is-previewing" : ""].filter(Boolean).join(" ")}>
      <a className="thumbnail-link" href={`/watch?id=${video.id}`} onMouseEnter={startPreview} onMouseLeave={stopPreview} onFocus={startPreview} onBlur={stopPreview}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} loading="lazy" decoding="async" className="thumbnail" />
        ) : (
          <span className="thumbnail-auto" data-cat={video.category || "Other"}>
            <span className="thumbnail-auto-initial">{(video.channelName || video.ownerName || "K")[0].toUpperCase()}</span>
            <span className="thumbnail-auto-title">{video.title}</span>
          </span>
        )}
        {hasPreviewVideo ? (
          <video
            aria-hidden="true"
            className="thumbnail-preview-video"
            loop
            muted
            playsInline
            ref={previewRef}
          />
        ) : (
          <span className="thumbnail-preview-fallback" aria-hidden="true" />
        )}
        <span className="thumbnail-preview-badge">{hasPreviewVideo ? "Preview" : "Quick preview"}</span>
        <span className="duration">{video.duration || "0:00"}</span>
      </a>
      <div className="video-card-body">
        <a className="video-title" href={`/watch?id=${video.id}`}>
          {video.title}
        </a>
        <a className="channel-link" href={`/channel?id=${video.channelId || video.userId}`}>
          {video.channelName || video.ownerName || "KujuaTime Creator"}
        </a>
        <p className="video-meta">
          {formatViews(video.views)} · {formatDate(video.createdAt)}
        </p>
        {reason && !compact ? <span className="recommendation-reason">{reason}</span> : null}
      </div>
    </article>
  );
}
