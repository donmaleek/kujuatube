import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { apiRequest } from "../../services/api.js";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/admin/analytics").then(setAnalytics).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading analytics" />;

  return (
    <>
      <section className="page-heading">
        <h1>Analytics</h1>
        <p>Aggregate engagement for deployed instances.</p>
      </section>
      <section className="metric-grid">
        <article><strong>{analytics?.totalViews || 0}</strong><span>Total views</span></article>
        <article><strong>{analytics?.totalLikes || 0}</strong><span>Total likes</span></article>
        <article><strong>{analytics?.averageViews || 0}</strong><span>Average views</span></article>
      </section>
    </>
  );
}
