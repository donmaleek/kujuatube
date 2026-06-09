import { useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { updateProfile, uploadAvatar as uploadAvatarFile, uploadBanner as uploadBannerFile } from "../../services/userService.js";
import { formatDate } from "../../utils/formatDate.js";

const TABS = ["Basic info", "Branding"];

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 8a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm6.5-12H21a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2.5l1.83-2h9.34L18.5 5zM5.5 6H3v11h18V6h-2.5l-1.83-2H7.33L5.5 6z" />
    </svg>
  );
}

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function UserProfile() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState("Basic info");
  const [name, setName] = useState(user?.name || "");
  const [handle, setHandle] = useState(user?.channelHandle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  if (!user) {
    return (
      <section className="empty-state">
        <h1>Sign in required</h1>
        <p>Your profile appears after you sign in.</p>
      </section>
    );
  }

  const avatarSrc = avatarPreview || user.avatarUrl || "";
  const bannerSrc = bannerPreview || user.bannerUrl || "";
  const initial = (user.name || user.email || "U")[0].toUpperCase();

  function flash(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  }

  async function handleSaveBasicInfo(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), bio: bio.trim(), channelHandle: handle.trim() });
      await refresh();
      flash("Profile updated.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(user.name || "");
    setHandle(user.channelHandle || "");
    setBio(user.bio || "");
    setMessage({ text: "", type: "" });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploadingAvatar(true);
    try {
      await uploadAvatarFile(file);
      await refresh();
      flash("Profile picture updated.");
    } catch (err) {
      setAvatarPreview(null);
      flash(err.message, "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleBannerChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview);
    setUploadingBanner(true);
    try {
      await uploadBannerFile(file);
      await refresh();
      flash("Channel banner updated.");
    } catch (err) {
      setBannerPreview(null);
      flash(err.message, "error");
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  }

  async function handleRemoveBanner() {
    setBannerPreview(null);
    try {
      await updateProfile({ bannerUrl: "" });
      await refresh();
      flash("Banner removed.");
    } catch (err) {
      flash(err.message, "error");
    }
  }

  return (
    <div className="profile-editor">
      {/* Banner */}
      <div
        className="profile-editor-banner"
        style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : {}}
        onClick={() => bannerInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") bannerInputRef.current?.click(); }}
        aria-label="Change channel banner"
      >
        {!bannerSrc && (
          <span className="profile-editor-banner-empty">
            {uploadingBanner ? "Uploading…" : "Add channel art"}
          </span>
        )}
        <div className="profile-editor-banner-overlay">
          <button
            type="button"
            className="btn-ghost-light"
            onClick={(e) => { e.stopPropagation(); bannerInputRef.current?.click(); }}
          >
            <CameraIcon />
            {uploadingBanner ? "Uploading…" : "Change"}
          </button>
          {bannerSrc && (
            <button
              type="button"
              className="btn-ghost-light"
              onClick={(e) => { e.stopPropagation(); handleRemoveBanner(); }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Identity bar */}
      <div className="profile-editor-identity">
        <div
          className="profile-editor-avatar-wrap"
          onClick={() => avatarInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") avatarInputRef.current?.click(); }}
          aria-label="Change profile picture"
        >
          <div className="profile-editor-avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt={user.name} />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="profile-editor-avatar-overlay">
            {uploadingAvatar ? <span style={{ fontSize: "0.7rem" }}>…</span> : <CameraIcon />}
          </div>
        </div>

        <div className="profile-editor-identity-info">
          <h2>{user.name}</h2>
          <p className="muted">
            @{user.channelHandle || user.id}
            {user.subscribers > 0 ? ` · ${fmtCount(user.subscribers)} subscribers` : ""}
          </p>
          <p className="muted">Joined {formatDate(user.createdAt)} · {user.role}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-editor-tabs tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {message.text && (
        <p className={`profile-editor-message ${message.type}`}>{message.text}</p>
      )}

      {/* Basic info */}
      {tab === "Basic info" && (
        <form className="profile-editor-section" onSubmit={handleSaveBasicInfo}>
          <div className="form-group">
            <label htmlFor="pe-name">Channel name</label>
            <input
              id="pe-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
            <small>{name.length} / 100</small>
          </div>

          <div className="form-group">
            <label htmlFor="pe-handle">Handle</label>
            <div className="handle-input-wrap">
              <span className="handle-at">@</span>
              <input
                id="pe-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))}
                maxLength={30}
                placeholder="your_handle"
              />
            </div>
            <small>Letters, numbers, underscores, dots — up to 30 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="pe-bio">Description</label>
            <textarea
              id="pe-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Tell viewers about your channel"
            />
            <small>{bio.length} / 1000</small>
          </div>

          <div className="profile-editor-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Branding */}
      {tab === "Branding" && (
        <div className="profile-editor-section">
          <div className="branding-item">
            <div className="branding-item-info">
              <h4>Profile picture</h4>
              <p>Your profile picture appears next to your videos and comments.</p>
              <p>Recommended: 98 × 98 px or larger, JPG or PNG, under 4 MB.</p>
            </div>
            <div className="branding-item-preview">
              <div className="branding-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name} />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading…" : "Change"}
              </button>
              {avatarSrc && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={async () => {
                    setAvatarPreview(null);
                    try {
                      await updateProfile({ avatarUrl: "" });
                      await refresh();
                      flash("Profile picture removed.");
                    } catch (err) {
                      flash(err.message, "error");
                    }
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="branding-item">
            <div className="branding-item-info">
              <h4>Banner image</h4>
              <p>This image appears across the top of your channel page.</p>
              <p>Recommended: 2560 × 1440 px, under 6 MB, JPG or PNG.</p>
            </div>
            <div className="branding-item-preview">
              {bannerSrc ? (
                <div
                  className="branding-banner-preview"
                  style={{ backgroundImage: `url(${bannerSrc})` }}
                />
              ) : (
                <div className="branding-banner-placeholder" />
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
              >
                {uploadingBanner ? "Uploading…" : "Upload"}
              </button>
              {bannerSrc && (
                <button type="button" className="btn-ghost" onClick={handleRemoveBanner}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs — shared across tabs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={handleAvatarChange}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleBannerChange}
      />
    </div>
  );
}
