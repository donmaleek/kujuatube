import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

function getNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function getSignupPath() {
  return `/signup?next=${encodeURIComponent(getNextPath())}`;
}

export default function Login() {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: "demo@kujuatime.com", password: "Password123!" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      await login(values);
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
          <h1>Sign in</h1>
          <p>to continue to KujuaTime</p>
        </div>
        <div className="auth-preview-strip" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="auth-form-pane">
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
            autoComplete="current-password"
            type="password"
            value={values.password}
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            required
          />
        </label>
        <a className="auth-helper-link" href="/forgot-password">Forgot password?</a>
        {error ? <p className="error-text auth-error">{error}</p> : null}
        <div className="auth-actions">
          <a className="auth-text-button" href={getSignupPath()}>Create account</a>
          <button className="auth-primary-button">Next</button>
        </div>
      </section>
    </form>
  );
}
