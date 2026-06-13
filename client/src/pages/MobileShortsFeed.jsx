import { useEffect, useRef, useState } from "react";
import MobileTikTokCard from "../components/video/MobileTikTokCard.jsx";

export default function MobileShortsFeed({ videos }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const feedRef = useRef(null);
  const cardRefsRef = useRef([]);

  // Prevent the page-content from scrolling while the feed is mounted
  useEffect(() => {
    const pageContent = document.querySelector(".page-content");
    if (!pageContent) return;
    const prev = pageContent.style.overflow;
    pageContent.style.overflow = "hidden";
    return () => { pageContent.style.overflow = prev; };
  }, []);

  // IntersectionObserver: mark the most-visible card as active
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed || !videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = cardRefsRef.current.indexOf(entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { root: feed, threshold: 0.5 }
    );

    const cards = cardRefsRef.current.filter(Boolean);
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [videos]);

  if (!videos.length) {
    return (
      <div className="tt-feed tt-feed-empty">
        <p>No videos yet. Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="tt-feed" ref={feedRef}>
      {/* "For You" header overlay */}
      <div className="tt-feed-header" aria-hidden="true">
        <span className="tt-feed-header-tab active">For You</span>
      </div>

      {videos.map((video, index) => (
        <MobileTikTokCard
          key={video.id}
          video={video}
          active={index === activeIndex}
          preloadNext={index === activeIndex + 1}
          ref={(el) => { cardRefsRef.current[index] = el; }}
        />
      ))}
    </div>
  );
}
