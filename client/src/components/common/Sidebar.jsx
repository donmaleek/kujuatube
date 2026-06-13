import YoutubeIcon from "./YoutubeIcon.jsx";
import Footer from "./Footer.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const primaryItems = [
  { label: "Home", path: "/", icon: "home" },
  { label: "Shorts", path: "/shorts", icon: "shorts" },
  { label: "Subscriptions", path: "/subscriptions", icon: "subscriptions" }
];

const youItems = [
  { label: "History", path: "/history", icon: "history" },
  { label: "Playlists", path: "/playlists", icon: "playlist", authOnly: true },
  { label: "Your videos", path: "/studio", icon: "yourVideos", authOnly: true },
  { label: "Watch Later", path: "/library", icon: "watchLater", authOnly: true },
  { label: "Liked videos", path: "/liked-videos", icon: "like", authOnly: true }
];

const exploreItems = [
  { label: "Trending", path: "/trending", icon: "trending" },
  { label: "Music", path: "/search?category=Music", icon: "music" },
  { label: "News", path: "/search?category=News", icon: "news" },
  { label: "Sports", path: "/search?category=Sports", icon: "trending" },
  { label: "Education", path: "/search?category=Education", icon: "courses" },
  { label: "Technology", path: "/search?category=Technology", icon: "podcast" }
];

const supportItems = [
  { label: "Settings", path: "/profile", icon: "settings" }
];

const uploadLoginPath = "/login?next=%2Fupload";

export default function Sidebar({ collapsed = false }) {
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const { user } = useAuth();

  function isActive(path) {
    const [pathName, query] = path.split("?");
    if (path === "/") return currentPath === "/";
    if (query) return currentPath === pathName && currentSearch === `?${query}`;
    return currentPath === pathName;
  }

  function renderItem(item) {
    return (
      <a className={isActive(item.path) ? "active" : ""} href={item.path} key={item.label} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}>
        <YoutubeIcon name={item.icon} />
        <span>{item.label}</span>
      </a>
    );
  }

  return (
    <>
    <aside className={collapsed ? "sidebar youtube-sidebar collapsed" : "sidebar youtube-sidebar"}>
      <nav aria-label="Primary">
        <div className="youtube-sidebar-group">{primaryItems.map(renderItem)}</div>

        <div className="youtube-sidebar-group">
          <a className={currentPath === "/library" ? "active section-link" : "section-link"} href="/library" title={collapsed ? "You" : undefined} aria-label={collapsed ? "You" : undefined}>
            <YoutubeIcon name="you" />
            <span>You</span>
            <strong>›</strong>
          </a>
          {youItems.filter((item) => user || !item.authOnly).map(renderItem)}
        </div>

        {!user ? (
          <div className="youtube-sidebar-group youtube-sidebar-auth">
            <p>Sign in to like videos, comment, and subscribe.</p>
            <a className="youtube-sidebar-signin" href={uploadLoginPath}>
              <YoutubeIcon name="userCircle" size={20} />
              <span>Sign in</span>
            </a>
          </div>
        ) : null}

        <div className="youtube-sidebar-group">
          <h3>Explore</h3>
          {exploreItems.map(renderItem)}
        </div>

        <div className="youtube-sidebar-group">{supportItems.map(renderItem)}</div>
      </nav>
      <Footer />
    </aside>

    {/* Mobile bottom navigation — visible only at ≤980px via CSS */}
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <a href="/" className={currentPath === "/" ? "active" : ""}>
        <YoutubeIcon name="home" size={22} />
        <span>Home</span>
      </a>
      <a href="/subscriptions" className={currentPath === "/subscriptions" ? "active" : ""}>
        <YoutubeIcon name="subscriptions" size={22} />
        <span>Feed</span>
      </a>
      <a href="/upload" className="mobile-nav-create" aria-label="Create">
        <span className="mobile-nav-plus">+</span>
      </a>
      <a href="/history" className={currentPath === "/history" ? "active" : ""}>
        <YoutubeIcon name="history" size={22} />
        <span>History</span>
      </a>
      <a href={user ? "/profile" : "/login"} className={currentPath === "/profile" ? "active" : ""}>
        <YoutubeIcon name="userCircle" size={22} />
        <span>{user ? "You" : "Sign in"}</span>
      </a>
    </nav>
    </>
  );
}
