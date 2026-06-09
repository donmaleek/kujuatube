import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import VideoCard from "../components/common/VideoCard.jsx";
import YoutubeIcon from "../components/common/YoutubeIcon.jsx";
import { useVideos } from "../hooks/useVideo.js";

export default function Downloads() {
  const { videos, loading } = useVideos();
  const downloadable = videos.filter((video) => video.videoUrl).slice(0, 12);

  return (
    <>
      <section className="page-heading with-action">
        <div>
          <h1>Downloads</h1>
          <p>Save creator videos for offline watching and field learning.</p>
        </div>
        <a className="button primary" href="/search?sort=views">
          <YoutubeIcon name="search" size={18} />
          Find videos
        </a>
      </section>
      {loading ? <LoadingSpinner label="Loading downloads" /> : null}
      <section className="download-actions-strip">
        <article>
          <YoutubeIcon name="download" />
          <strong>Offline-first learning</strong>
          <span>Videos with uploaded media expose direct browser download actions.</span>
        </article>
        <article>
          <YoutubeIcon name="courses" />
          <strong>Build a course shelf</strong>
          <span>Use downloads with courses when learners have unstable internet.</span>
        </article>
      </section>
      <section className="search-results">
        {downloadable.map((video) => (
          <div className="download-result" key={video.id}>
            <VideoCard video={video} compact />
            <a className="button" href={video.videoUrl} download>
              <YoutubeIcon name="download" size={18} />
              Download
            </a>
          </div>
        ))}
        {!loading && !downloadable.length ? <p className="muted">Uploaded videos with downloadable files will appear here.</p> : null}
      </section>
    </>
  );
}
