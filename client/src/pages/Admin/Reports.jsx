import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { apiRequest } from "../../services/api.js";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/admin/reports").then((data) => setReports(data.reports || data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-heading">
        <h1>Reports</h1>
      </section>
      {loading ? <LoadingSpinner label="Loading reports" /> : null}
      <section className="list-panel">
        {reports.map((report) => (
          <article className="list-row" key={report.id}>
            <div>
              <h3>{report.reason}</h3>
              <p className="muted">{report.status} · video {report.videoId}</p>
            </div>
          </article>
        ))}
        {!loading && !reports.length ? <p className="muted">No reports.</p> : null}
      </section>
    </>
  );
}
