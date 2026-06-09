import VideoCard from "../components/common/VideoCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useVideos } from "../hooks/useVideo.js";

export default function LikedVideos() {
  const { videos, loading } = useVideos({ sort: "views" });
  const liked = videos.slice(0, 6);

  return (
    <>
      <section className="page-heading">
        <h1>Liked videos</h1>
        <p>Videos you have liked appear here.</p>
      </section>
      {loading ? <LoadingSpinner label="Loading liked videos" /> : null}
      <section className="video-grid">
        {liked.map((video) => (
          <VideoCard video={video} key={video.id} />
        ))}
      </section>
    </>
  );
}
