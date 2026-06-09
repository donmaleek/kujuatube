import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form className="auth-page auth-youtube-card compact" onSubmit={submit}>
      <section className="auth-brand-pane">
        <a className="auth-brand-lockup" href="/" aria-label="KujuaTime home">
          <span className="auth-brand-mark"><span /></span>
          <strong>KujuaTime</strong>
        </a>
        <div>
          <h1>Reset password</h1>
          <p>Enter the email on your account</p>
        </div>
      </section>
      <section className="auth-form-pane">
        <label className="auth-field">
          Email
          <input
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        {sent ? <p className="success-text auth-error">If an account exists, a reset link has been queued.</p> : null}
        <div className="auth-actions">
          <a className="auth-text-button" href="/login">Back to sign in</a>
          <button className="auth-primary-button">Send reset link</button>
        </div>
      </section>
    </form>
  );
}
