import { useEffect, useState } from "react";
import VideoCard from "../components/common/VideoCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { getTrendingVideos } from "../services/videoService.js";

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getTrendingVideos()
      .then((data) => {
        if (!cancelled) setVideos(data.videos || data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="page-heading">
        <h1>Trending</h1>
        <p>Videos gaining momentum across KujuaTime.</p>
      </section>
      {loading ? <LoadingSpinner label="Loading trending videos" /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <section className="video-grid">
        {videos.map((video) => (
          <VideoCard video={video} key={video.id} />
        ))}
      </section>
    </>
  );
}
