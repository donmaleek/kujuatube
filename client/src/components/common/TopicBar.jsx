const topics = [
  "All",
  "Education",
  "Technology",
  "Music",
  "Culture",
  "News",
  "Sports"
];

export default function TopicBar() {
  const params = new URLSearchParams(window.location.search);
  const current = params.get("category") || "All";

  return (
    <nav className="youtube-topic-bar" aria-label="Video topics">
      {topics.map((topic) => {
        const href = topic === "All" ? "/" : `/search?category=${encodeURIComponent(topic)}`;
        return (
          <a className={current === topic ? "active" : ""} href={href} key={topic}>
            {topic}
          </a>
        );
      })}
    </nav>
  );
}
