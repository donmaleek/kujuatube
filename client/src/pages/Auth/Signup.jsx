import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

function getNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/upload";
}

function getLoginPath() {
  return `/login?next=${encodeURIComponent(getNextPath())}`;
}

export default function Signup() {
  const { signup } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      await signup(values);
      window.location.href = getNextPath();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="auth-page auth-youtube-card" onSubmit={submit}>
      <section className="auth-brand-pane">
        <a className="auth-brand-lockup" href="/" aria-label="KujuaTime home">
          <span className="auth-brand-mark"><span /></span>
          <strong>KujuaTime</strong>
        </a>
        <div>
          <h1>Create account</h1>
          <p>to publish and follow creators</p>
        </div>
        <div className="auth-preview-strip create" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="auth-form-pane">
        <label className="auth-field">
          Name
          <input
            autoComplete="name"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            required
          />
        </label>
        <label className="auth-field">
          Email
          <input
            autoComplete="email"
            type="email"
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            required
          />
        </label>
        <label className="auth-field">
          Password
          <input
            autoComplete="new-password"
            minLength="8"
            type="password"
            value={values.password}
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            required
          />
        </label>
        {error ? <p className="error-text auth-error">{error}</p> : null}
        <div className="auth-actions">
          <a className="auth-text-button" href={getLoginPath()}>Sign in instead</a>
          <button className="auth-primary-button">Create account</button>
        </div>
      </section>
    </form>
  );
}
