import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import VideoCard from "../components/common/VideoCard.jsx";
import YoutubeIcon from "../components/common/YoutubeIcon.jsx";
import { useVideos } from "../hooks/useVideo.js";

export default function Courses() {
  const { videos, loading } = useVideos({ category: "Education" });
  const featured = videos.slice(0, 9);

  return (
    <>
      <section className="page-heading with-action">
        <div>
          <h1>Courses</h1>
          <p>Structured learning paths from KujuaTime creators.</p>
        </div>
        <a className="button primary" href="/upload">
          <YoutubeIcon name="upload" size={18} />
          Teach a course
        </a>
      </section>
      {loading ? <LoadingSpinner label="Loading courses" /> : null}
      <section className="course-path-grid">
        <article>
          <YoutubeIcon name="courses" />
          <span>Starter path</span>
          <strong>Creator fundamentals</strong>
          <p>Plan, record, package, and publish a video series.</p>
        </article>
        <article>
          <YoutubeIcon name="sparkle" />
          <span>Growth path</span>
          <strong>Audience momentum</strong>
          <p>Turn comments, shorts, and posts into repeat viewers.</p>
        </article>
        <article>
          <YoutubeIcon name="download" />
          <span>Field path</span>
          <strong>Offline learning</strong>
          <p>Keep key lessons available anywhere learners are working.</p>
        </article>
      </section>
      <section className="video-grid">
        {featured.map((video) => (
          <VideoCard video={video} key={video.id} />
        ))}
        {!loading && !featured.length ? <p className="muted">Education videos will appear here as courses.</p> : null}
      </section>
    </>
  );
}
