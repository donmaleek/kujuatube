import VideoCard from "../../components/common/VideoCard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { useVideos } from "../../hooks/useVideo.js";

export default function VideosList() {
  const { videos, loading } = useVideos();

  return (
    <>
      <section className="page-heading">
        <h1>Videos</h1>
      </section>
      {loading ? <LoadingSpinner label="Loading videos" /> : null}
      <section className="search-results">
        {videos.map((video) => (
          <VideoCard video={video} compact key={video.id} />
        ))}
      </section>
    </>
  );
}
