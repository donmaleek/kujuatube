import { useAuth } from "../../hooks/useAuth.js";
import { getInitials } from "../../utils/helpers.js";
import YoutubeIcon from "../common/YoutubeIcon.jsx";

const uploadLoginPath = "/login?next=%2Fupload";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <a className="youtube-signin-button" href={uploadLoginPath}>
        <YoutubeIcon name="userCircle" size={20} />
        Sign in
      </a>
    );
  }

  return (
    <div className="user-menu youtube-user-menu">
      <a className="avatar youtube-avatar" href="/profile" title={user.name}>
        {getInitials(user.name || user.email)}
      </a>
      <button className="youtube-user-signout" onClick={logout} title="Sign out">
        Sign out
      </button>
    </div>
  );
}
