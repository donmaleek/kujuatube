import { useMemo } from "react";
import VideoCard from "../components/common/VideoCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useKujuaTimePreferences } from "../hooks/useKujuaTimePreferences.js";
import { useVideos } from "../hooks/useVideo.js";
import { getVideoSignals, rankVideos } from "../utils/recommendations.js";
import { getViewerRegion } from "../utils/region.js";

export default function Home() {
  const { videos, loading, error } = useVideos();
  const { preferences } = useKujuaTimePreferences();
  const region = useMemo(() => getViewerRegion(), []);
  const rankedVideos = useMemo(() => rankVideos(videos, preferences, region), [videos, preferences, region]);

  return (
    <>
      <h1 className="sr-only">KujuaTime feed</h1>
      {loading ? <LoadingSpinner label="Loading videos" /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <section className="video-grid home-video-grid">
        {rankedVideos.map((video) => (
          <VideoCard reason={getVideoSignals(video, preferences, region).join(" · ")} video={video} key={video.id} />
        ))}
      </section>
    </>
  );
}
