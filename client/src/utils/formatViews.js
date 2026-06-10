export function formatViews(value = 0) {
  const views = Number(value) || 0;

  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;

  return `${views} ${views === 1 ? "view" : "views"}`;
}
