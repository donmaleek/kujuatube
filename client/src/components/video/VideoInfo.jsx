import { useState } from "react";
import { formatDate } from "../../utils/formatDate.js";
import { formatViews } from "../../utils/formatViews.js";
import SubscribeButton from "../channel/SubscribeButton.jsx";
import VideoActions from "./VideoActions.jsx";

export default function VideoInfo({ video, theater, onToggleTheater }) {
  const [expanded, setExpanded] = useState(false);

  if (!video) return null;

  return (
    <section className="video-info">
      <h1>{video.title}</h1>
      <div className="watch-below-title">
        <div className="watch-channel-cluster">
          <a className="channel-row" href={`/channel?id=${video.channelId || video.userId}`}>
            <span className="avatar">{(video.channelName || "K").slice(0, 1)}</span>
            <span>
              <strong>{video.channelName || video.ownerName || "KujuaTime Creator"}</strong>
              <small>{video.subscribers || 0} subscribers</small>
            </span>
          </a>
          <SubscribeButton channelId={video.channelId || video.userId} />
        </div>
        <VideoActions video={video} theater={theater} onToggleTheater={onToggleTheater} />
      </div>
      <button className={expanded ? "watch-description expanded" : "watch-description"} onClick={() => setExpanded((value) => !value)}>
        <strong>
          {formatViews(video.views)} · {formatDate(video.createdAt)}
        </strong>
        <span className="watch-hashtags">#KujuaTime #Learning #Creators</span>
        <span>{video.description || "No description provided."}</span>
        {!expanded ? <em>Show more</em> : <em>Show less</em>}
      </button>
    </section>
  );
}
