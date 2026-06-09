import { useMemo, useState } from "react";
import ChannelAbout from "../components/channel/ChannelAbout.jsx";
import ChannelHeader from "../components/channel/ChannelHeader.jsx";
import ChannelPlaylists from "../components/channel/ChannelPlaylists.jsx";
import ChannelTabs from "../components/channel/ChannelTabs.jsx";
import ChannelVideos from "../components/channel/ChannelVideos.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useVideos } from "../hooks/useVideo.js";

export default function Channel() {
  const channelId = new URLSearchParams(window.location.search).get("id") || "channel-1";
  const [activeTab, setActiveTab] = useState("videos");
  const { videos, loading } = useVideos({ channelId });

  const channel = useMemo(() => {
    const first = videos[0] || {};
    return {
      id: channelId,
      name: first.channelName || "KujuaTime Creators",
      handle: first.channelHandle || "kujuatime",
      subscribers: first.subscribers || 1280,
      videoCount: videos.length,
      totalViews: videos.reduce((sum, video) => sum + (Number(video.views) || 0), 0),
      createdAt: first.createdAt || new Date().toISOString(),
      about: first.channelAbout || "A creator channel on KujuaTime.",
      bannerUrl: first.thumbnailUrl
    };
  }, [channelId, videos]);

  const playlists = [{ id: "featured", title: "Featured uploads", videos, videoCount: videos.length }];

  return (
    <>
      <ChannelHeader channel={channel} />
      <ChannelTabs activeTab={activeTab} onChange={setActiveTab} />
      {loading ? <LoadingSpinner label="Loading channel" /> : null}
      {activeTab === "videos" ? <ChannelVideos videos={videos} /> : null}
      {activeTab === "playlists" ? <ChannelPlaylists playlists={playlists} /> : null}
      {activeTab === "about" ? <ChannelAbout channel={channel} /> : null}
    </>
  );
}
