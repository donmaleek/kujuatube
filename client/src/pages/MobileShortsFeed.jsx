import { useEffect, useRef, useState } from "react";
import MobileTikTokCard from "../components/video/MobileTikTokCard.jsx";

export default function MobileShortsFeed({ videos }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const feedRef = useRef(null);
  const cardRefsRef = useRef([]);

  // Prevent page-content from scrolling and mark body as TikTok-active while feed is mounted
  useEffect(() => {
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      const prev = pageContent.style.overflow;
      pageContent.style.overflow = "hidden";
      var restoreOverflow = () => { pageContent.style.overflow = prev; };
    }
    document.body.classList.add("tt-feed-active");
    return () => {
      restoreOverflow?.();
      document.body.classList.remove("tt-feed-active", "tt-overlay-hidden");
    };
  }, []);

  // Sync TopicBar visibility with overlay state via body class
  useEffect(() => {
    if (headerVisible) {
      document.body.classList.remove("tt-overlay-hidden");
    } else {
      document.body.classList.add("tt-overlay-hidden");
    }
  }, [headerVisible]);

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
      <div className={headerVisible ? "tt-feed-header" : "tt-feed-header overlay-hidden"} aria-hidden="true">
        <span className="tt-feed-header-tab active">For You</span>
      </div>

      {videos.map((video, index) => (
        <MobileTikTokCard
          key={video.id}
          video={video}
          active={index === activeIndex}
          preloadNext={index === activeIndex + 1}
          onOverlayChange={index === activeIndex ? setHeaderVisible : undefined}
          ref={(el) => { cardRefsRef.current[index] = el; }}
        />
      ))}
    </div>
  );
}
