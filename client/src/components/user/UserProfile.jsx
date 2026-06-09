import { useAuth } from "../../hooks/useAuth.js";
import { formatDate } from "../../utils/formatDate.js";

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="empty-state">
        <h1>Sign in required</h1>
        <p>Your profile appears after you sign in.</p>
      </section>
    );
  }

  return (
    <section className="profile-panel">
      <span className="channel-avatar">{(user.name || user.email).slice(0, 1)}</span>
      <div>
        <h1>{user.name}</h1>
        <p className="muted">{user.email}</p>
        <p>Joined {formatDate(user.createdAt)}</p>
        <p>Role: {user.role}</p>
      </div>
    </section>
  );
}
