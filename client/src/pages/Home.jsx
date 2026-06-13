import { useEffect, useMemo, useState } from "react";
import VideoCard from "../components/common/VideoCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useKujuaTimePreferences } from "../hooks/useKujuaTimePreferences.js";
import { useVideos } from "../hooks/useVideo.js";
import { getVideoSignals, rankVideos } from "../utils/recommendations.js";
import { getViewerRegion } from "../utils/region.js";
import MobileShortsFeed from "./MobileShortsFeed.jsx";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 980px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 980px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function Home() {
  const { videos, loading, error } = useVideos();
  const { preferences } = useKujuaTimePreferences();
  const region = useMemo(() => getViewerRegion(), []);
  const rankedVideos = useMemo(() => rankVideos(videos, preferences, region), [videos, preferences, region]);
  const isMobile = useIsMobile();

  if (loading) return <LoadingSpinner label="Loading videos" />;
  if (error) return <p className="error-text">{error}</p>;

  if (isMobile) {
    return <MobileShortsFeed videos={rankedVideos} />;
  }

  return (
    <>
      <h1 className="sr-only">KujuaTime feed</h1>
      <section className="video-grid home-video-grid">
        {rankedVideos.map((video) => (
          <VideoCard reason={getVideoSignals(video, preferences, region).join(" · ")} video={video} key={video.id} />
        ))}
      </section>
    </>
  );
}
