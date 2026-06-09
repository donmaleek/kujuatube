import { useContext, useEffect, useRef, useState } from "react";
import UserMenu from "../user/UserMenu.jsx";
import { ThemeContext } from "../../context/ThemeContext.js";
import { useAuth } from "../../hooks/useAuth.js";
import { createCommunityPost, createLaunchKit, createLiveRoom } from "../../services/creatorService.js";
import { getNotifications, markAllNotificationsRead } from "../../services/notificationService.js";
import { apiRequest } from "../../services/api.js";
import { formatDate } from "../../utils/formatDate.js";
import { getViewerRegion } from "../../utils/region.js";
import YoutubeIcon from "./YoutubeIcon.jsx";

const uploadLoginPath = "/login?next=%2Fupload";
const studioLoginPath = "/login?next=%2Fadmin";
const LIVE_CATEGORIES = ["Education", "Technology", "Music", "Culture", "News", "Sports", "Gaming"];

const LIVE_STEP_LABELS = ["Choose method", "Stream details", "You're live"];

export default function Header({ sidebarCollapsed = false, onToggleSidebar }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creatorTool, setCreatorTool] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [creatorSaving, setCreatorSaving] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  const [postDraft, setPostDraft] = useState({ body: "", visibility: "public" });

  const [liveStep, setLiveStep] = useState(1);
  const [liveMethod, setLiveMethod] = useState("encoder");
  const [liveDraft, setLiveDraft] = useState({
    title: "", description: "", visibility: "public",
    category: "Education", audience: "not_kids", thumbnail: ""
  });
  const [liveRoom, setLiveRoom] = useState(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEsRef = useRef(null);
  const chatScrollRef = useRef(null);

  const [launchIdea, setLaunchIdea] = useState("");
  const [launchKit, setLaunchKit] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const [region] = useState(() => getViewerRegion());

  const searchInputRef = useRef(null);
  const createMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const webcamRef = useRef(null);
  const screenPreviewRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mimeTypeRef = useRef("video/webm;codecs=vp8,opus");
  const [showEncoderDetails, setShowEncoderDetails] = useState(false);

  const [viewerCount, setViewerCount] = useState(0);

  const themeContext = useContext(ThemeContext) || { theme: "light", toggleTheme: () => {} };
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    getNotifications()
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function onPointerDown(event) {
      if (!createMenuRef.current?.contains(event.target)) setCreateOpen(false);
      if (!moreMenuRef.current?.contains(event.target)) setMoreOpen(false);
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
    }

    function onKeyDown(event) {
      const tagName = event.target?.tagName;
      const isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || event.target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setCreateOpen(false);
        setCreatorTool("");
        setMoreOpen(false);
        setNotificationsOpen(false);
        setShortcutsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function toggleMenu() {
    if (window.matchMedia("(max-width: 980px)").matches) {
      setMenuOpen((v) => !v);
      return;
    }
    onToggleSidebar?.();
  }

  function submitSearch(event) {
    event.preventDefault();
    const nextQuery = query.trim();
    window.location.href = nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search";
  }

  async function copyCurrentPage() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const scratch = document.createElement("textarea");
      scratch.value = window.location.href;
      scratch.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(scratch);
      scratch.select();
      document.execCommand("copy");
      scratch.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openCreatorTool(tool) {
    setCreateOpen(false);
    setCreateStatus("");
    setLiveRoom(null);
    setLiveStep(1);
    setLiveMethod("webcam");
    setKeyVisible(false);
    setShowEncoderDetails(false);
    setCreatorTool(tool);
  }

  function closeCreatorTool() {
    stopWebcam();
    setCreatorTool("");
    setCreateStatus("");
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCreateStatus("Copied to clipboard.");
    } catch {
      setCreateStatus(value);
    }
  }

  async function savePostDraft() {
    const body = postDraft.body.trim();
    if (!body) { setCreateStatus("Write something for your post first."); return; }
    setCreatorSaving(true);
    setCreateStatus("");
    try {
      await createCommunityPost({ ...postDraft, body, status: "published" });
      setPostDraft({ body: "", visibility: "public" });
      setCreateStatus("Post published to your channel feed.");
    } catch (error) {
      setCreateStatus(error.message);
    } finally {
      setCreatorSaving(false);
    }
  }

  async function handleLiveNext() {
    if (liveStep === 1) {
      setLiveStep(2);
      return;
    }
    if (liveStep === 2) {
      const title = liveDraft.title.trim();
      if (!title) { setCreateStatus("Stream title is required."); return; }
      setCreatorSaving(true);
      setCreateStatus("");
      try {
        const room = await createLiveRoom({ ...liveDraft, title });
        setLiveRoom(room);
        setLiveStep(3);
        setCreateStatus("");
        if (liveMethod === "webcam") startWebcam(room);
        else if (liveMethod === "software") startScreenShare(room);
        // Connect to chat SSE so broadcaster sees viewer messages
        const chatEs = new EventSource(`/api/live/${room.id}/chat/stream`);
        chatEsRef.current = chatEs;
        chatEs.addEventListener("message", (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            setChatMessages((prev) => [...prev, msg].slice(-100));
          } catch {}
        });
      } catch (error) {
        setCreateStatus(error.message);
      } finally {
        setCreatorSaving(false);
      }
    }
  }

  async function startWebcam(roomOverride) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: { ideal: 48000 }
        }
      });
      webcamStreamRef.current = stream;
      if (webcamRef.current) webcamRef.current.srcObject = stream;
      startMediaRecorder(stream, roomOverride);
    } catch {
      setCreateStatus("Camera access was denied. Try screen share instead, or use an encoder with the details below.");
    }
  }

  async function startScreenShare(roomOverride) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 }, cursor: "always" },
        audio: true
      });
      screenStreamRef.current = screenStream;

      // Try to mix in microphone for voice commentary
      let finalStream = screenStream;
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const dest = audioCtx.createMediaStreamDestination();
        if (screenStream.getAudioTracks().length > 0) {
          audioCtx.createMediaStreamSource(new MediaStream(screenStream.getAudioTracks())).connect(dest);
        }
        audioCtx.createMediaStreamSource(micStream).connect(dest);
        finalStream = new MediaStream([...screenStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
      } catch {
        // Mic denied — stream screen video + system audio only
      }

      webcamStreamRef.current = finalStream;
      if (screenPreviewRef.current) screenPreviewRef.current.srcObject = screenStream;
      startMediaRecorder(finalStream, roomOverride);

      // Auto-stop if user ends share via browser UI
      screenStream.getVideoTracks()[0]?.addEventListener("ended", () => {
        endLive();
      });
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        setCreateStatus("Screen capture cancelled. Choose webcam or click 'Set up stream' again.");
      } else {
        setCreateStatus("Could not start screen capture. Use Chrome or Firefox.");
      }
    }
  }

  function startMediaRecorder(stream, roomOverride) {
    const room = roomOverride || liveRoom;
    if (!room) return;

    const mimeType = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9,opus",
      "video/webm"
    ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

    if (!mimeType) { setCreateStatus("Your browser does not support WebM recording. Use OBS with the stream key below."); return; }
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 128_000 });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) return;
      apiRequest(`/api/live/${room.id}/chunk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Mime-Type": mimeType,
          "X-Title": room.title || "Live stream",
          "X-Channel": user?.name || "Creator"
        },
        body: event.data
      }).then((d) => {
        if (d?.viewers !== undefined) setViewerCount(d.viewers);
      }).catch(() => {});
    };

    recorder.start(1000); // 1s chunks — smaller payload, lower latency
  }

  function stopWebcam() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    webcamStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }

  async function endLive() {
    const room = liveRoom;
    stopWebcam();
    chatEsRef.current?.close();
    chatEsRef.current = null;
    if (room) {
      apiRequest(`/api/live/${room.id}/end`, { method: "POST" }).catch(() => {});
    }
    setLiveRoom(null);
    setLiveStep(1);
    setViewerCount(0);
    setChatMessages([]);
    setChatInput("");
    setCreateStatus("Stream ended.");
    window.setTimeout(closeCreatorTool, 800);
  }

  async function sendBroadcasterChat(e) {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || !liveRoom) return;
    try {
      await apiRequest(`/api/live/${liveRoom.id}/chat`, {
        method: "POST",
        body: JSON.stringify({ text, displayName: user?.name || "Creator" })
      });
      setChatInput("");
    } catch {}
  }

  // Auto-scroll broadcaster chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Poll viewer count while live
  useEffect(() => {
    if (creatorTool !== "live" || liveStep !== 3 || !liveRoom) return;
    const id = window.setInterval(() => {
      apiRequest(`/api/live/${liveRoom.id}/info`).then((d) => {
        if (d?.viewerCount !== undefined) setViewerCount(d.viewerCount);
      }).catch(() => {});
    }, 8000);
    return () => window.clearInterval(id);
  }, [creatorTool, liveStep, liveRoom]);

  async function buildLaunchKit() {
    const idea = launchIdea.trim();
    setCreatorSaving(true);
    setCreateStatus("");
    try {
      const result = await createLaunchKit({ idea, region });
      setLaunchKit(result.kit);
      setCreateStatus("Launch Kit generated and saved to your creator workspace.");
    } catch (error) {
      setCreateStatus(error.message);
    } finally {
      setCreatorSaving(false);
    }
  }

  function handleNotificationsToggle() {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen && unreadCount > 0) {
      markAllNotificationsRead()
        .then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))))
        .catch(() => {});
    }
  }

  function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { searchInputRef.current?.focus(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => setVoiceListening(false);
    recognition.onerror = () => { setVoiceListening(false); searchInputRef.current?.focus(); };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) return;
      setQuery(transcript);
      window.location.href = `/search?q=${encodeURIComponent(transcript)}`;
    };
    recognition.start();
  }

  function liveToolTitle() {
    if (creatorTool !== "live") return "";
    return LIVE_STEP_LABELS[liveStep - 1] || "Go live";
  }

  return (
    <header className="site-header youtube-header">
      <div className="youtube-header-left">
        <button className={sidebarCollapsed ? "yt-icon-button active" : "yt-icon-button"} onClick={toggleMenu} aria-label={sidebarCollapsed ? "Expand guide" : "Collapse guide"} aria-pressed={sidebarCollapsed} type="button">
          <YoutubeIcon name="menu" />
        </button>
        <a className="youtube-brand" href="/" aria-label="KujuaTime home">
          <span className="youtube-brand-mark"><span /></span>
          <span className="youtube-brand-word">KujuaTime</span>
          <sup className="youtube-brand-region">{region}</sup>
        </a>
      </div>

      <form className="youtube-search" onSubmit={submitSearch} role="search">
        <div className="youtube-search-box">
          <input
            aria-label="Search"
            placeholder="Search"
            value={query}
            ref={searchInputRef}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="youtube-search-button" aria-label="Search">
            <YoutubeIcon name="search" />
          </button>
        </div>
        <button className={voiceListening ? "yt-icon-button youtube-mic-button active" : "yt-icon-button youtube-mic-button"} onClick={startVoiceSearch} type="button" aria-label="Search with your voice" aria-pressed={voiceListening}>
          <YoutubeIcon name="mic" />
        </button>
      </form>

      <div className="youtube-header-actions">
        {user ? (
          <>
            <div className="youtube-create-wrap" ref={createMenuRef}>
              <button className={createOpen ? "youtube-create-button active" : "youtube-create-button"} onClick={() => setCreateOpen((v) => !v)} aria-label="Create" aria-expanded={createOpen} type="button">
                <YoutubeIcon name="plus" size={20} />
                <span>Create</span>
              </button>
              {createOpen ? (
                <div className="youtube-create-panel">
                  <button type="button" onClick={() => openCreatorTool("post")}>
                    <YoutubeIcon name="feedback" size={19} />
                    <span>
                      <strong>Create post</strong>
                      <small>Share an update with your community</small>
                    </span>
                  </button>
                  <a href="/upload">
                    <YoutubeIcon name="upload" size={19} />
                    <span>
                      <strong>Upload video</strong>
                      <small>Open KujuaTime Studio</small>
                    </span>
                  </a>
                  <button type="button" onClick={() => openCreatorTool("live")}>
                    <YoutubeIcon name="trending" size={19} />
                    <span>
                      <strong>Go live</strong>
                      <small>Stream to your audience in real time</small>
                    </span>
                  </button>
                  <button className="create-panel-feature" type="button" onClick={() => openCreatorTool("launch")}>
                    <YoutubeIcon name="sparkle" size={19} />
                    <span>
                      <strong>Launch Kit</strong>
                      <small>Hooks, chapters, tags, and best publish window</small>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="youtube-notification-wrap" ref={notificationRef}>
              <button
                className={notificationsOpen ? "yt-icon-button notification-button active" : "yt-icon-button notification-button"}
                onClick={handleNotificationsToggle}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                type="button"
              >
                <YoutubeIcon name="bell" />
                {unreadCount > 0 ? (
                  <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                ) : null}
              </button>

              {notificationsOpen ? (
                <div className="youtube-notification-panel">
                  <div className="notif-panel-header">
                    <strong>Notifications</strong>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No notifications yet. Subscribe to channels to get updates here.</p>
                  ) : (
                    notifications.map((notif) => (
                      <a
                        key={notif.id}
                        href={notif.videoId ? `/watch?id=${notif.videoId}` : "/"}
                        className={notif.read ? "notif-item" : "notif-item unread"}
                      >
                        <span className="notif-avatar">{(notif.channelName || "K")[0].toUpperCase()}</span>
                        <span className="notif-body">
                          <span className="notif-text">{notif.title}</span>
                          {notif.body ? <span className="notif-desc">{notif.body}</span> : null}
                          <span className="notif-time">{formatDate(notif.createdAt)}</span>
                        </span>
                        {!notif.read ? <span className="notif-dot" aria-hidden="true" /> : <span />}
                      </a>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="youtube-more-wrap" ref={moreMenuRef}>
          <button className={moreOpen ? "yt-icon-button active" : "yt-icon-button"} onClick={() => setMoreOpen((v) => !v)} aria-label="More options" aria-expanded={moreOpen} type="button">
            <YoutubeIcon name="more" />
          </button>
          {moreOpen ? (
            <div className="youtube-more-panel">
              <section>
                <span>Quick actions</span>
                <a href={user ? "/upload" : uploadLoginPath}>
                  <YoutubeIcon name="upload" size={19} />
                  Upload or go live
                </a>
                <a href={user ? "/admin" : studioLoginPath}>
                  <YoutubeIcon name="yourVideos" size={19} />
                  Creator Studio
                </a>
                <button type="button" onClick={copyCurrentPage}>
                  <YoutubeIcon name="share" size={19} />
                  {copied ? "Copied page link" : "Copy page link"}
                </button>
              </section>
              <section>
                <span>Experience</span>
                <button type="button" onClick={themeContext.toggleTheme}>
                  <YoutubeIcon name="settings" size={19} />
                  Appearance: {themeContext.theme === "dark" ? "Dark" : "Light"}
                </button>
                <button type="button" onClick={() => setShortcutsOpen(true)}>
                  <YoutubeIcon name="transcript" size={19} />
                  Keyboard shortcuts
                </button>
                <a href="/trending">
                  <YoutubeIcon name="sparkle" size={19} />
                  Creator pulse
                </a>
              </section>
              <section>
                <span>Support</span>
                <a href="/profile">
                  <YoutubeIcon name="settings" size={19} />
                  Settings
                </a>
                <a href="/admin/reports">
                  <YoutubeIcon name="report" size={19} />
                  Report history
                </a>
                <a href="mailto:support@kujuatime.com?subject=KujuaTime%20Feedback">
                  <YoutubeIcon name="feedback" size={19} />
                  Send feedback
                </a>
              </section>
            </div>
          ) : null}
        </div>
        <UserMenu />
      </div>

      <button className="yt-icon-button mobile-search-button" onClick={() => { window.location.href = "/search"; }} aria-label="Search" type="button">
        <YoutubeIcon name="search" />
      </button>

      {isMenuOpen ? (
        <nav className="youtube-mobile-menu">
          <a href="/">Home</a>
          <a href="/trending">Trending</a>
          <a href="/subscriptions">Subscriptions</a>
          <a href="/library">You</a>
          <a href={user ? "/upload" : uploadLoginPath}>Create</a>
        </nav>
      ) : null}

      {shortcutsOpen ? (
        <div className="youtube-shortcuts-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="youtube-shortcuts-card">
            <header>
              <strong>Keyboard shortcuts</strong>
              <button className="yt-icon-button" onClick={() => setShortcutsOpen(false)} aria-label="Close shortcuts" type="button">
                <YoutubeIcon name="close" />
              </button>
            </header>
            <dl>
              <dt>/</dt><dd>Focus search</dd>
              <dt>K or Space</dt><dd>Play or pause video</dd>
              <dt>J / L</dt><dd>Back or forward 10 seconds</dd>
              <dt>M</dt><dd>Mute or unmute</dd>
              <dt>C</dt><dd>Captions</dd>
              <dt>F</dt><dd>Fullscreen</dd>
              <dt>T</dt><dd>Theater mode</dd>
            </dl>
          </div>
        </div>
      ) : null}

      {creatorTool ? (
        <div className="creator-tool-modal" role="dialog" aria-modal="true" aria-label="Creator tool">
          <section className={creatorTool === "live" ? "creator-tool-card is-live" : "creator-tool-card"}>
            <header>
              <div>
                <span>KujuaTime Create</span>
                <strong>
                  {creatorTool === "post" ? "Create post" : creatorTool === "live" ? liveToolTitle() : "Launch Kit"}
                </strong>
              </div>
              <button className="yt-icon-button" onClick={closeCreatorTool} aria-label="Close creator tool" type="button">
                <YoutubeIcon name="close" />
              </button>
            </header>

            {/* ── Create post ── */}
            {creatorTool === "post" ? (
              <div className="creator-tool-form">
                <textarea value={postDraft.body} onChange={(e) => setPostDraft({ ...postDraft, body: e.target.value })} placeholder="Write a post for your viewers..." rows="5" />
                <label>
                  Visibility
                  <select value={postDraft.visibility} onChange={(e) => setPostDraft({ ...postDraft, visibility: e.target.value })}>
                    <option value="public">Public</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="private">Private draft</option>
                  </select>
                </label>
                <button className="auth-primary-button" disabled={creatorSaving} onClick={savePostDraft} type="button">
                  {creatorSaving ? "Publishing…" : "Publish post"}
                </button>
              </div>
            ) : null}

            {/* ── Go live – multi-step ── */}
            {creatorTool === "live" ? (
              <div className="creator-tool-form">
                {/* Step indicator */}
                <div className="live-steps" aria-label="Progress">
                  {LIVE_STEP_LABELS.map((label, i) => (
                    <span key={label} className={liveStep >= i + 1 ? "live-step active" : "live-step"}>
                      <span>{i + 1}</span>
                      {label}
                    </span>
                  ))}
                </div>

                {/* Step 1 – method */}
                {liveStep === 1 ? (
                  <div className="live-method-grid">
                    <button
                      className={liveMethod === "webcam" ? "live-method-card active" : "live-method-card"}
                      type="button"
                      onClick={() => setLiveMethod("webcam")}
                    >
                      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M23 7 16 12l7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" />
                      </svg>
                      <strong>Webcam</strong>
                      <small>Go live from your camera and mic</small>
                    </button>
                    <button
                      className={liveMethod === "software" ? "live-method-card active" : "live-method-card"}
                      type="button"
                      onClick={() => setLiveMethod("software")}
                    >
                      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      <strong>Screen Share</strong>
                      <small>Share your screen, app, or game window</small>
                    </button>
                  </div>
                ) : null}

                {/* Step 2 – details */}
                {liveStep === 2 ? (
                  <>
                    <input
                      value={liveDraft.title}
                      onChange={(e) => setLiveDraft({ ...liveDraft, title: e.target.value })}
                      placeholder="Stream title (required)"
                    />
                    <textarea
                      value={liveDraft.description}
                      onChange={(e) => setLiveDraft({ ...liveDraft, description: e.target.value })}
                      placeholder="Description (optional)"
                      rows="3"
                    />
                    <label>
                      Category
                      <select value={liveDraft.category} onChange={(e) => setLiveDraft({ ...liveDraft, category: e.target.value })}>
                        {LIVE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                    <label>
                      Visibility
                      <select value={liveDraft.visibility} onChange={(e) => setLiveDraft({ ...liveDraft, visibility: e.target.value })}>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private test</option>
                      </select>
                    </label>
                    <label>
                      Audience
                      <select value={liveDraft.audience} onChange={(e) => setLiveDraft({ ...liveDraft, audience: e.target.value })}>
                        <option value="not_kids">Not made for kids</option>
                        <option value="kids">Made for kids</option>
                      </select>
                    </label>
                    <input
                      value={liveDraft.thumbnail}
                      onChange={(e) => setLiveDraft({ ...liveDraft, thumbnail: e.target.value })}
                      placeholder="Thumbnail URL (optional)"
                    />
                  </>
                ) : null}

                {/* Step 3 – stream setup */}
                {liveStep === 3 && liveRoom ? (
                  <div className="live-stream-setup">
                    {/* Webcam preview */}
                    {liveMethod === "webcam" ? (
                      <div className="live-webcam-preview">
                        <video ref={webcamRef} autoPlay muted playsInline />
                        <span className="live-webcam-badge">LIVE</span>
                      </div>
                    ) : null}

                    {/* Screen share preview */}
                    {liveMethod === "software" ? (
                      <div className="live-webcam-preview">
                        <video ref={screenPreviewRef} autoPlay muted playsInline />
                        <span className="live-webcam-badge">LIVE</span>
                      </div>
                    ) : null}

                    {/* Status bar */}
                    <div className="live-health">
                      <span className="live-health-dot" />
                      {liveMethod === "webcam"
                        ? `Live · ${viewerCount} ${viewerCount === 1 ? "viewer" : "viewers"} watching`
                        : liveMethod === "software"
                        ? `Sharing screen · ${viewerCount} ${viewerCount === 1 ? "viewer" : "viewers"} watching`
                        : `Waiting for encoder · ${viewerCount} ${viewerCount === 1 ? "viewer" : "viewers"} watching`}
                    </div>

                    {/* Share link – always visible */}
                    <div className="live-stream-share-row">
                      <label>Share link</label>
                      <div className="live-key-row">
                        <input readOnly value={`${window.location.origin}/live?id=${liveRoom.id}`} />
                        <button type="button" onClick={() => copyText(`${window.location.origin}/live?id=${liveRoom.id}`)}>Copy</button>
                      </div>
                    </div>

                    {/* Collapsible encoder / advanced section */}
                    <button
                      type="button"
                      className="live-encoder-toggle"
                      onClick={() => setShowEncoderDetails((v) => !v)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points={showEncoderDetails ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                      </svg>
                      Use an encoder (OBS / Streamlabs / ffmpeg)
                    </button>

                    {showEncoderDetails ? (
                      <div className="live-stream-setup-fields">
                        <p className="live-encoder-hint">
                          Open OBS → Settings → Stream → Custom RTMP, or paste the HTTP URL into ffmpeg.
                          The stream key authenticates your connection.
                        </p>
                        <label>
                          Ingest URL
                          <div className="live-key-row">
                            <input readOnly value={`${window.location.origin}/api/live/${liveRoom.id}/chunk`} />
                            <button type="button" onClick={() => copyText(`${window.location.origin}/api/live/${liveRoom.id}/chunk`)}>Copy</button>
                          </div>
                        </label>
                        <label>
                          Stream key
                          <div className="live-key-row">
                            <input readOnly type={keyVisible ? "text" : "password"} value={liveRoom.streamKey} />
                            <button type="button" onClick={() => setKeyVisible((v) => !v)}>{keyVisible ? "Hide" : "Show"}</button>
                            <button type="button" onClick={() => copyText(liveRoom.streamKey)}>Copy</button>
                          </div>
                        </label>
                        <label>
                          ffmpeg one-liner
                          <div className="live-key-row">
                            <input readOnly value={`ffmpeg -re -i input.mp4 -c:v libvpx -c:a libopus -f webm -headers "Authorization: Bearer ${liveRoom.streamKey}" "${window.location.origin}/api/live/${liveRoom.id}/chunk"`} />
                            <button type="button" onClick={() => copyText(`ffmpeg -re -i input.mp4 -c:v libvpx -c:a libopus -f webm -headers "Authorization: Bearer ${liveRoom.streamKey}" "${window.location.origin}/api/live/${liveRoom.id}/chunk"`)}>Copy</button>
                          </div>
                        </label>
                      </div>
                    ) : null}

                    {/* Broadcaster live chat */}
                    <div className="broadcaster-chat">
                      <div className="broadcaster-chat-header">
                        Live chat
                        <span>{chatMessages.length} messages</span>
                      </div>
                      <div className="broadcaster-chat-messages" ref={chatScrollRef}>
                        {chatMessages.length === 0 ? (
                          <p className="broadcaster-chat-empty">Viewer messages will appear here</p>
                        ) : (
                          chatMessages.map((msg) => (
                            <div key={msg.id} className="broadcaster-chat-msg">
                              <strong>{msg.displayName}</strong>
                              <span>{msg.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <form className="broadcaster-chat-input-row" onSubmit={sendBroadcasterChat}>
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Reply to viewers…"
                          maxLength={200}
                        />
                        <button type="submit" disabled={!chatInput.trim()}>Send</button>
                      </form>
                    </div>
                  </div>
                ) : null}

                {/* Navigation */}
                <div className="creator-tool-actions">
                  {liveStep > 1 && liveStep < 3 ? (
                    <button className="auth-text-button" type="button" onClick={() => { setLiveStep((s) => s - 1); setCreateStatus(""); }}>
                      Back
                    </button>
                  ) : null}
                  {liveStep < 3 ? (
                    <button className="auth-primary-button" disabled={creatorSaving} onClick={handleLiveNext} type="button">
                      {creatorSaving ? "Setting up…" : liveStep === 2 ? "Set up stream" : "Next"}
                    </button>
                  ) : (
                    <button className="auth-primary-button live-end-button" type="button" onClick={endLive}>
                      End stream
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* ── Launch Kit ── */}
            {creatorTool === "launch" ? (
              <div className="creator-tool-form">
                <input value={launchIdea} onChange={(e) => setLaunchIdea(e.target.value)} placeholder="Video idea, topic, or audience promise" />
                <button className="auth-primary-button" disabled={creatorSaving} onClick={buildLaunchKit} type="button">
                  {creatorSaving ? "Building…" : "Build Launch Kit"}
                </button>
                {launchKit ? (
                  <div className="launch-kit-output">
                    <strong>{launchKit.title}</strong>
                    <p>{launchKit.hook}</p>
                    <small>{launchKit.thumbnail}</small>
                    <span>{launchKit.publishWindow}</span>
                    <ul>{launchKit.chapters.map((ch) => <li key={ch}>{ch}</li>)}</ul>
                    {launchKit.checklist ? <ol>{launchKit.checklist.map((item) => <li key={item}>{item}</li>)}</ol> : null}
                    <p>{launchKit.tags.join(" ")}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {createStatus ? <p className="creator-tool-status">{createStatus}</p> : null}
          </section>
        </div>
      ) : null}
    </header>
  );
}
