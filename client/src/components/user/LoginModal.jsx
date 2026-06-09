import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

export default function LoginModal({ open, onClose, onSignup }) {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: "demo@kujuatime.com", password: "Password123!" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await login(values);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal auth-modal" onSubmit={submit}>
        <header className="auth-modal-header">
          <span className="auth-brand-mark"><span /></span>
          <div>
            <h2>Sign in</h2>
            <p>to continue to KujuaTime</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            x
          </button>
        </header>
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
          <button className="auth-text-button" type="button" onClick={onSignup}>
            Create account
          </button>
          <button className="auth-primary-button" disabled={saving}>
            {saving ? "Signing in" : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
