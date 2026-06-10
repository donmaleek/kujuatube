import { useEffect, useMemo, useState } from "react";
import Header from "./components/common/Header.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import TopicBar from "./components/common/TopicBar.jsx";
import MiniPlayer from "./components/video/MiniPlayer.jsx";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Channel from "./pages/Channel.jsx";
import Courses from "./pages/Courses.jsx";
import Downloads from "./pages/Downloads.jsx";
import Search from "./pages/Search.jsx";
import Upload from "./pages/Upload.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Library from "./pages/Library.jsx";
import History from "./pages/History.jsx";
import Playlists from "./pages/Playlists.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import Trending from "./pages/Trending.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import UsersList from "./pages/Admin/UsersList.jsx";
import VideosList from "./pages/Admin/VideosList.jsx";
import Reports from "./pages/Admin/Reports.jsx";
import Analytics from "./pages/Admin/Analytics.jsx";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import UserProfile from "./components/user/UserProfile.jsx";
import Live from "./pages/Live.jsx";
import { usePlayer } from "./context/PlayerContext.js";

const routes = {
  "/": Home,
  "/shorts": Trending,
  "/watch": Watch,
  "/channel": Channel,
  "/courses": Courses,
  "/downloads": Downloads,
  "/search": Search,
  "/upload": Upload,
  "/subscriptions": Subscriptions,
  "/library": Library,
  "/history": History,
  "/playlists": Playlists,
  "/liked-videos": LikedVideos,
  "/trending": Trending,
  "/admin": AdminDashboard,
  "/admin/users": UsersList,
  "/admin/videos": VideosList,
  "/admin/reports": Reports,
  "/admin/analytics": Analytics,
  "/login": Login,
  "/signup": Signup,
  "/forgot-password": ForgotPassword,
  "/profile": UserProfile,
  "/live": Live
};

function getStoredSidebarState() {
  try {
    return window.localStorage.getItem("kujuatime-sidebar-collapsed") === "true";
  } catch {
    return false;
  }
}

export default function App() {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search
  }));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getStoredSidebarState);
  const { activeVideo, openMiniPlayer, playbackState } = usePlayer();
  const Page = routes[location.pathname] || Home;
  const showTopicBar = ["/", "/search", "/trending", "/subscriptions"].includes(location.pathname);
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(location.pathname);
  // Watch page always shows icons-only sidebar (same as YouTube)
  const effectiveCollapsed = location.pathname === "/watch" || sidebarCollapsed;

  const navigate = useMemo(
    () => (url) => {
      const nextUrl = new URL(url, window.location.origin);
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextPath === currentPath) return;

      // Push current video to mini player when navigating away from a playing watch page.
      // Covers both watch→other-page AND watch→different-video-on-watch.
      if (location.pathname === "/watch" && activeVideo && playbackState.playing) {
        const currentVideoId = new URLSearchParams(location.search).get("id");
        const nextVideoId = nextUrl.searchParams.get("id");
        const isSameVideo = nextUrl.pathname === "/watch" && nextVideoId === currentVideoId;
        if (!isSameVideo) {
          openMiniPlayer(activeVideo, { ...playbackState, playing: true });
        }
      }

      window.history.pushState({}, "", nextPath);
      setLocation({ pathname: nextUrl.pathname, search: nextUrl.search });
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [activeVideo, location.pathname, location.search, openMiniPlayer, playbackState]
  );

  useEffect(() => {
    function onPopState() {
      setLocation({ pathname: window.location.pathname, search: window.location.search });
    }

    function onDocumentClick(event) {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const nextUrl = new URL(link.href, window.location.origin);
      if (nextUrl.origin !== window.location.origin) return;

      event.preventDefault();
      navigate(nextUrl);
    }

    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onDocumentClick);

    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [navigate]);

  useEffect(() => {
    try {
      window.localStorage.setItem("kujuatime-sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // Keep the current in-memory sidebar state when storage is unavailable.
    }
  }, [sidebarCollapsed]);

  return (
    <div className={effectiveCollapsed && !isAuthPage ? "app-shell sidebar-is-collapsed" : "app-shell"}>
      <Header sidebarCollapsed={effectiveCollapsed} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
      <div className={isAuthPage ? "app-layout auth-layout" : effectiveCollapsed ? "app-layout sidebar-collapsed-layout" : "app-layout"}>
        {isAuthPage ? null : <Sidebar collapsed={effectiveCollapsed} />}
        <main className={isAuthPage ? "page-content auth-page-content" : "page-content"}>
          {showTopicBar ? <TopicBar /> : null}
          <Page />
        </main>
      </div>
      <MiniPlayer />
    </div>
  );
}
