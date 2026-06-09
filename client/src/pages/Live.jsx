import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../utils/constants.js";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function getAnonName() {
  try {
    const stored = localStorage.getItem("kujuatime-viewer-name");
    if (stored) return stored;
    const name = `Viewer #${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem("kujuatime-viewer-name", name);
    return name;
  } catch {
    return "Viewer";
  }
}

export default function Live() {
  const liveId = new URLSearchParams(window.location.search).get("id");
  const { user } = useAuth();

  const videoRef = useRef(null);
  const msRef = useRef(null);
  const sbRef = useRef(null);
  const queueRef = useRef([]);
  const esRef = useRef(null);
  const chunkCountRef = useRef(0);
  const skipInitChunkRef = useRef(false); // discard replayed init segment on SSE reconnect
  const [streamStarted, setStreamStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [videoError, setVideoError] = useState("");

  const [info, setInfo] = useState({ title: "", channelName: "", viewerCount: 0 });

  const chatEsRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const displayName = user?.name || getAnonName();

  useEffect(() => {
    if (!liveId) return;
    const load = () =>
      fetch(`${API_BASE_URL}/api/live/${liveId}/info`)
        .then((r) => r.json())
        .then((d) => setInfo((prev) => ({ ...prev, ...d })))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 10_000);
    return () => window.clearInterval(id);
  }, [liveId]);

  useEffect(() => {
    if (!liveId) return;
    const es = new EventSource(`${API_BASE_URL}/api/live/${liveId}/chat/stream`);
    chatEsRef.current = es;
    es.addEventListener("message", (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        setMessages((prev) => [...prev, msg].slice(-200));
      } catch {}
    });
    es.addEventListener("ended", () => es.close());
    return () => es.close();
  }, [liveId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!liveId) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const ms = new MediaSource();
    msRef.current = ms;
    const objUrl = URL.createObjectURL(ms);
    videoEl.src = objUrl;

    // Remove buffered data behind currentTime to prevent QuotaExceededError
    function cleanBuffer() {
      const sb = sbRef.current;
      if (!sb || sb.updating) return;
      try {
        const buffered = sb.buffered;
        if (buffered.length === 0) return;
        const bufStart = buffered.start(0);
        const removeUntil = videoEl.currentTime - 30;
        if (removeUntil > bufStart + 1) {
          sb.remove(bufStart, removeUntil);
        }
      } catch {}
    }

    function processQueue() {
      const sb = sbRef.current;
      if (!sb || sb.updating || queueRef.current.length === 0) return;
      if (ms.readyState !== "open") {
        queueRef.current = [];
        return;
      }
      const chunk = queueRef.current.shift();
      try {
        sb.appendBuffer(chunk);
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          queueRef.current.unshift(chunk);
          cleanBuffer();
        }
        // Any other error (InvalidStateError, etc.) — discard chunk, don't retry
      }
    }

    // Keep video within 3s of the live edge; seek forward if too far behind
    function stayAtLiveEdge() {
      const sb = sbRef.current;
      if (!sb || sb.updating) return;
      try {
        const buffered = sb.buffered;
        if (buffered.length === 0) return;
        const liveEdge = buffered.end(buffered.length - 1);
        if (liveEdge - videoEl.currentTime > 4) {
          videoEl.currentTime = Math.max(liveEdge - 1, buffered.start(0));
        }
      } catch {}
    }

    // Start playback once we have 1.5s buffered
    function tryPlay() {
      if (!videoEl.paused) return;
      const sb = sbRef.current;
      if (!sb) return;
      try {
        const buffered = sb.buffered;
        if (buffered.length === 0) return;
        const buffDuration = buffered.end(buffered.length - 1) - buffered.start(0);
        if (buffDuration >= 1.5) {
          videoEl.play().catch(() => {});
        }
      } catch {}
    }

    // When video stalls and there is already buffered data ahead, seek into it
    function handleWaiting() {
      const sb = sbRef.current;
      if (!sb) return;
      try {
        const buffered = sb.buffered;
        for (let i = 0; i < buffered.length; i++) {
          const end = buffered.end(i);
          const start = buffered.start(i);
          if (end > videoEl.currentTime + 0.5) {
            if (videoEl.currentTime < start) videoEl.currentTime = start;
            videoEl.play().catch(() => {});
            break;
          }
        }
      } catch {}
    }

    videoEl.addEventListener("waiting", handleWaiting);

    ms.addEventListener("sourceopen", () => {
      try { ms.duration = Infinity; } catch {}

      const es = new EventSource(`${API_BASE_URL}/api/live/${liveId}/stream`);
      esRef.current = es;
      let sbReady = false;

      es.addEventListener("init", (evt) => {
        try {
          const { mimeType } = JSON.parse(evt.data);

          // SSE reconnected after a drop — SourceBuffer already exists.
          // Don't call addSourceBuffer again (it would throw InvalidStateError).
          // The next chunk event will replay the stored init segment; skip it.
          if (sbRef.current) {
            skipInitChunkRef.current = true;
            sbReady = true;
            setVideoError("");
            return;
          }

          if (!MediaSource.isTypeSupported(mimeType)) {
            setVideoError("Your browser doesn't support this stream format. Try Chrome or Firefox.");
            es.close();
            return;
          }
          const sb = ms.addSourceBuffer(mimeType);
          // sequence mode tolerates timestamp gaps — essential for live streams
          try { sb.mode = "sequence"; } catch {}
          sbRef.current = sb;
          sb.addEventListener("updateend", () => {
            processQueue();
            tryPlay();
            stayAtLiveEdge();
          });
          sbReady = true;
          setStreamStarted(true);
        } catch {
          if (!sbRef.current) {
            setVideoError("Failed to initialise stream decoder.");
          }
        }
      });

      es.addEventListener("chunk", (evt) => {
        if (!sbReady) return;

        // Discard the replayed init segment sent after an SSE reconnect.
        // Appending the WebM header onto an existing SourceBuffer corrupts the stream.
        if (skipInitChunkRef.current) {
          skipInitChunkRef.current = false;
          return;
        }

        chunkCountRef.current++;
        queueRef.current.push(base64ToUint8Array(evt.data));
        processQueue();
        // Proactively clean old data every 20 chunks (~20s at 1s/chunk)
        if (chunkCountRef.current % 20 === 0) cleanBuffer();
        stayAtLiveEdge();
        tryPlay();
        // Clear any transient error overlay once chunks are flowing again
        setVideoError((prev) => (prev ? "" : prev));
      });

      es.addEventListener("ended", () => {
        setEnded(true);
        try { if (ms.readyState === "open") ms.endOfStream(); } catch {}
        es.close();
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) setEnded(true);
      };
    });

    return () => {
      videoEl.removeEventListener("waiting", handleWaiting);
      esRef.current?.close();
      try { if (msRef.current?.readyState === "open") msRef.current.endOfStream(); } catch {}
      URL.revokeObjectURL(objUrl);
    };
  }, [liveId]);

  async function sendChat(e) {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || sendingChat) return;
    setSendingChat(true);
    try {
      await apiRequest(`/api/live/${liveId}/chat`, {
        method: "POST",
        body: JSON.stringify({ text, displayName })
      });
      setChatInput("");
    } catch {}
    setSendingChat(false);
  }

  if (!liveId) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No stream ID provided.</h2>
        <p>Use the share link from the Go Live setup.</p>
      </div>
    );
  }

  const isOffline = ended || !streamStarted;

  return (
    <div className="live-viewer-page">
      <div className="live-viewer-left">
        <div className="live-viewer-video-wrap">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            className="live-viewer-video"
          />

          {isOffline ? (
            <div className="live-offline-overlay">
              <div className="live-offline-pulse" />
              <strong>{ended ? "Stream ended" : "Waiting for stream…"}</strong>
              <p>
                {ended
                  ? "The creator has ended this stream."
                  : "The page updates automatically when the creator goes live."}
              </p>
            </div>
          ) : (
            <span className="live-viewer-badge">LIVE</span>
          )}

          {videoError ? (
            <div className="live-offline-overlay" style={{ background: "rgba(0,0,0,0.85)" }}>
              <strong style={{ color: "#f87171" }}>{videoError}</strong>
            </div>
          ) : null}
        </div>

        {!isOffline ? (
          <div className="live-viewer-meta">
            <h1 className="live-viewer-title">{info.title || "Live stream"}</h1>
            <div className="live-viewer-meta-row">
              <span className="live-viewer-channel">{info.channelName || "Creator"}</span>
              <span className="live-viewer-count">
                <span className="live-health-dot" />
                {info.viewerCount ?? 0} watching
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="live-chat-sidebar">
        <div className="live-chat-header">
          <strong>Live chat</strong>
          <span className="live-chat-count">{messages.length} messages</span>
        </div>

        <div className="live-chat-messages">
          {messages.length === 0 ? (
            <p className="live-chat-empty">No messages yet. Be the first to say something!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="live-chat-msg">
                <span className="live-chat-name">{msg.displayName}</span>
                <span className="live-chat-text">{msg.text}</span>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        <form className="live-chat-input-row" onSubmit={sendChat}>
          <input
            className="live-chat-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Chat as ${displayName}…`}
            maxLength={200}
            disabled={sendingChat}
          />
          <button
            className="live-chat-send"
            type="submit"
            disabled={!chatInput.trim() || sendingChat}
          >
            Send
          </button>
        </form>
      </aside>
    </div>
  );
}
