import { useEffect, useRef, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";

// Extract a single JPEG frame from a video blob URL at a given timestamp
function extractFrameAt(videoSrc, time) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = videoSrc;

    let done = false;

    function finish(result) {
      if (done) return;
      done = true;
      video.src = "";
      resolve(result);
    }

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(time, Math.max(0, video.duration - 0.5));
    });

    video.addEventListener("seeked", () => {
      const w = Math.min(video.videoWidth || 1280, 1280);
      const h = Math.round(w * ((video.videoHeight || 720) / (video.videoWidth || 1280)));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(video, 0, 0, w, h);
      canvas.toBlob((blob) => {
        // Reject near-black frames (< 3 KB is almost certainly solid black)
        if (blob && blob.size > 3000) {
          finish({ blob, dataUrl: URL.createObjectURL(blob) });
        } else {
          finish(null);
        }
      }, "image/jpeg", 0.88);
    });

    video.addEventListener("error", () => finish(null));
    setTimeout(() => finish(null), 12000);
  });
}

function blobToFile(blob, name) {
  return new File([blob], name, { type: "image/jpeg" });
}

export default function ThumbnailUploader({ videoSrc, file, previewUrl, onSelect }) {
  const inputRef = useRef(null);
  const [frames, setFrames] = useState([]); // [{ blob, dataUrl }]
  const [extracting, setExtracting] = useState(false);
  const [selected, setSelected] = useState(null); // index | "custom" | null

  // Extract 3 frames whenever the video changes
  useEffect(() => {
    if (!videoSrc) {
      setFrames([]);
      setSelected(null);
      return undefined;
    }

    let cancelled = false;
    setExtracting(true);
    setFrames([]);
    setSelected(null);

    const probe = document.createElement("video");
    probe.muted = true;
    probe.src = videoSrc;
    probe.preload = "metadata";

    probe.addEventListener("loadedmetadata", async () => {
      if (cancelled) return;
      const d = probe.duration;
      const times = [d * 0.12, d * 0.35, d * 0.62];
      const results = await Promise.all(times.map((t) => extractFrameAt(videoSrc, t)));
      if (cancelled) return;
      const valid = results.filter(Boolean);
      setFrames(valid);
      setExtracting(false);

      // Auto-select first frame so the video always ships with a thumbnail
      if (valid.length > 0) {
        setSelected(0);
        onSelect(blobToFile(valid[0].blob, "thumbnail-auto.jpg"));
      }
    });

    probe.addEventListener("error", () => {
      if (!cancelled) setExtracting(false);
    });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc]);

  function pickFrame(index) {
    setSelected(index);
    onSelect(blobToFile(frames[index].blob, `thumbnail-${index}.jpg`));
  }

  function handleCustomFile(f) {
    if (!f) return;
    setSelected("custom");
    onSelect(f);
  }

  const hasFrames = frames.length > 0 || extracting;

  return (
    <section className="yt-thumbnail-section">
      <div className="yt-thumbnail-header">
        <h2>Thumbnail</h2>
        <p>Select or upload a picture that shows what your video is about. A good thumbnail stands out and draws viewers&apos; attention.</p>
      </div>

      {hasFrames || !videoSrc ? (
        <div className="yt-thumbnail-grid">
          {/* Auto-generated frames */}
          {extracting && frames.length === 0
            ? [0, 1, 2].map((i) => (
                <div key={i} className="yt-thumb-card yt-thumb-skeleton">
                  <div className="yt-thumb-shimmer" />
                </div>
              ))
            : frames.map((frame, i) => (
                <button
                  key={frame.dataUrl}
                  type="button"
                  className={selected === i ? "yt-thumb-card selected" : "yt-thumb-card"}
                  onClick={() => pickFrame(i)}
                  aria-label={`Auto-generated thumbnail ${i + 1}`}
                  aria-pressed={selected === i}
                >
                  <img src={frame.dataUrl} alt={`Auto thumbnail ${i + 1}`} />
                  {selected === i ? (
                    <span className="yt-thumb-check" aria-hidden="true">
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" /></svg>
                    </span>
                  ) : null}
                  <span className="yt-thumb-label">Auto {i + 1}</span>
                </button>
              ))}

          {/* Upload custom thumbnail */}
          <button
            type="button"
            className={selected === "custom" ? "yt-thumb-card yt-thumb-upload selected" : "yt-thumb-card yt-thumb-upload"}
            onClick={() => inputRef.current?.click()}
            aria-label="Upload custom thumbnail"
          >
            {selected === "custom" && previewUrl ? (
              <>
                <img src={previewUrl} alt="Custom thumbnail" />
                <span className="yt-thumb-check" aria-hidden="true">
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" /></svg>
                </span>
              </>
            ) : (
              <div className="yt-thumb-upload-inner">
                <YoutubeIcon name="upload" size={24} />
                <span>Upload thumbnail</span>
              </div>
            )}
            <span className="yt-thumb-label">Custom</span>
          </button>
        </div>
      ) : (
        /* No video selected yet — simple upload prompt */
        <button
          type="button"
          className="yt-thumb-card yt-thumb-upload yt-thumb-solo"
          onClick={() => inputRef.current?.click()}
        >
          <div className="yt-thumb-upload-inner">
            <YoutubeIcon name="upload" size={28} />
            <span>Upload thumbnail</span>
            <small>JPG, PNG, WebP · 16:9 recommended</small>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleCustomFile(e.target.files?.[0])}
      />

      {/* Selected thumbnail big preview */}
      {previewUrl ? (
        <div className="yt-thumbnail-preview">
          <img src={previewUrl} alt="Selected thumbnail" />
          <div className="yt-thumbnail-preview-meta">
            <strong>Thumbnail preview</strong>
            <small>{file?.name ?? "Auto-generated"}</small>
          </div>
        </div>
      ) : null}
    </section>
  );
}
