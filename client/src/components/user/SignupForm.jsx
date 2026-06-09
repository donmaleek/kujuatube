import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

export default function SignupForm({ open = true, onClose = () => {}, onLogin = () => {} }) {
  const { signup } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await signup(values);
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
            <h2>Create account</h2>
            <p>to publish on KujuaTime</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            x
          </button>
        </header>
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
            type="password"
            minLength="8"
            value={values.password}
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            required
          />
        </label>
        {error ? <p className="error-text auth-error">{error}</p> : null}
        <div className="auth-actions">
          <button className="auth-text-button" type="button" onClick={onLogin}>
            Sign in instead
          </button>
          <button className="auth-primary-button" disabled={saving}>
            {saving ? "Creating" : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}
