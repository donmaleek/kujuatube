import { useEffect, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";
import { fetchMyLike, likeVideo, dislikeVideo, removeLike } from "../../services/likeService.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function VideoActions({ video, theater, onToggleTheater }) {
  const { user } = useAuth();
  const [userLike, setUserLike] = useState(null); // null | 1 | -1
  const [likeCount, setLikeCount] = useState(video?.likes || 0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!user || !video?.id) return;
    fetchMyLike(video.id)
      .then((data) => {
        const mine = (data.likes || [])[0];
        if (mine) setUserLike(mine.value === 1 ? 1 : -1);
      })
      .catch(() => {});
  }, [user, video?.id]);

  function redirectToLogin() {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }

  async function handleLike() {
    if (!user) { redirectToLogin(); return; }
    if (userLike === 1) {
      await removeLike(video.id).catch(() => {});
      setUserLike(null);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await likeVideo(video.id).catch(() => {});
      if (userLike === null) setLikeCount((c) => c + 1);
      setUserLike(1);
    }
  }

  async function handleDislike() {
    if (!user) { redirectToLogin(); return; }
    if (userLike === -1) {
      await removeLike(video.id).catch(() => {});
      setUserLike(null);
    } else {
      await dislikeVideo(video.id).catch(() => {});
      if (userLike === 1) setLikeCount((c) => Math.max(0, c - 1));
      setUserLike(-1);
    }
  }

  async function share() {
    const url = `${window.location.origin}/watch?id=${video?.id || ""}`;
    if (navigator.share) {
      await navigator.share({ title: video?.title || "KujuaTime video", url }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <div className="video-actions youtube-watch-actions">
      <div className="watch-like-pill">
        <button className={userLike === 1 ? "selected" : ""} onClick={handleLike} aria-label="Like" aria-pressed={userLike === 1}>
          <YoutubeIcon name="like" size={20} />
          <span>{likeCount}</span>
        </button>
        <button className={userLike === -1 ? "selected" : ""} onClick={handleDislike} aria-label="Dislike" aria-pressed={userLike === -1}>
          <YoutubeIcon name="dislike" size={20} />
        </button>
      </div>
      <button className={shared ? "watch-action-pill selected" : "watch-action-pill"} onClick={share}>
        <YoutubeIcon name="share" size={20} />
        <span>{shared ? "Copied" : "Share"}</span>
      </button>
      <button className="watch-action-pill">
        <YoutubeIcon name="clip" size={20} />
        <span>Clip</span>
      </button>
      <button className="watch-action-pill">
        <YoutubeIcon name="save" size={20} />
        <span>Save</span>
      </button>
      <button className={theater ? "watch-action-pill selected" : "watch-action-pill"} onClick={onToggleTheater}>
        <YoutubeIcon name="theater" size={20} />
        <span>{theater ? "Default" : "Theater"}</span>
      </button>
    </div>
  );
}
