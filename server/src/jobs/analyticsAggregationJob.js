import { getAnalyticsSummary } from "../services/analyticsService.js";
import { setCache } from "../services/cacheService.js";

export function runAnalyticsAggregationJob() {
  const summary = getAnalyticsSummary();
  setCache("analytics:summary", summary, 5 * 60_000);
  return summary;
}
