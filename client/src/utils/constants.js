export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Trending", path: "/trending" },
  { label: "Subscriptions", path: "/subscriptions" },
  { label: "Library", path: "/library" },
  { label: "History", path: "/history" },
  { label: "Playlists", path: "/playlists" },
  { label: "Liked", path: "/liked-videos" },
  { label: "Upload", path: "/upload" }
];

export const VIDEO_CATEGORIES = [
  "Education",
  "Technology",
  "Music",
  "Culture",
  "News",
  "Sports",
  "Gaming"
];
