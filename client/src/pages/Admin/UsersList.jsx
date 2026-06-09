import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { apiRequest } from "../../services/api.js";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/users").then((data) => setUsers(data.users || data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-heading">
        <h1>Users</h1>
      </section>
      {loading ? <LoadingSpinner label="Loading users" /> : null}
      <section className="list-panel">
        {users.map((user) => (
          <article className="list-row" key={user.id}>
            <span className="avatar">{(user.name || user.email).slice(0, 1)}</span>
            <div>
              <h3>{user.name}</h3>
              <p className="muted">{user.email} · {user.role}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
