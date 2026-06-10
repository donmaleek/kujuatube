import { db } from "../config/database.js";

export function getAnalyticsSummary() {
  const totalViews = db.videos.reduce((sum, video) => sum + Number(video.views || 0), 0);
  const totalLikes = db.videos.reduce((sum, video) => sum + Number(video.likes || 0), 0);
  const averageViews = db.videos.length ? Math.round(totalViews / db.videos.length) : 0;

  return {
    totalViews,
    totalLikes,
    averageViews,
    videosByCategory: db.categories.map((category) => ({
      category,
      count: db.videos.filter((video) => video.category === category).length
    }))
  };
}

export function getAdminSummary() {
  return {
    users: db.users.length,
    videos: db.videos.length,
    comments: db.comments.length,
    reports: db.reports.length,
    subscriptions: db.subscriptions.length,
    playlists: db.playlists.length
  };
}
