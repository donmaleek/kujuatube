import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { apiRequest } from "../../services/api.js";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/admin/summary")
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading admin dashboard" />;

  return (
    <>
      <section className="page-heading">
        <h1>Admin dashboard</h1>
        <p>Operational overview for KujuaTime.</p>
      </section>
      <section className="metric-grid">
        <article><strong>{summary?.users || 0}</strong><span>Users</span></article>
        <article><strong>{summary?.videos || 0}</strong><span>Videos</span></article>
        <article><strong>{summary?.comments || 0}</strong><span>Comments</span></article>
        <article><strong>{summary?.reports || 0}</strong><span>Reports</span></article>
      </section>
      <nav className="admin-links">
        <a href="/admin/users">Users</a>
        <a href="/admin/videos">Videos</a>
        <a href="/admin/reports">Reports</a>
        <a href="/admin/analytics">Analytics</a>
      </nav>
    </>
  );
}
