import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../utils/constants.js";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

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
  const queueRef = useRef([]);              // Uint8Array chunks waiting to be appended
  const fetchResultsRef = useRef(new Map()); // seq -> Promise<Uint8Array|null>
  const fetchQueueRef = useRef(Promise.resolve()); // orders SourceBuffer appends
  const lastSeqRef = useRef(-1);            // highest seq scheduled for fetch
  const sbReadyRef = useRef(false);
  const esRef = useRef(null);

  const [streamStarted, setStreamStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [info, setInfo] = useState({ title: "", channelName: "", viewerCount: 0 });

  // Chat — use a Set to deduplicate replayed messages on SSE reconnect
  const seenMsgIds = useRef(new Set());
  const chatEsRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const displayName = user?.name || getAnonName();

  // ── Stream metadata poll ──────────────────────────────
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

  // ── Chat SSE ──────────────────────────────────────────
  useEffect(() => {
    if (!liveId) return;
    const es = new EventSource(`${API_BASE_URL}/api/live/${liveId}/chat/stream`);
    chatEsRef.current = es;
    es.addEventListener("message", (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        // Deduplicate: server replays last 50 messages on every SSE reconnect
        if (seenMsgIds.current.has(msg.id)) return;
        seenMsgIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg].slice(-200));
      } catch {}
    });
    es.addEventListener("ended", () => es.close());
    return () => es.close();
  }, [liveId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Video playback ────────────────────────────────────
  useEffect(() => {
    if (!liveId) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const ms = new MediaSource();
    msRef.current = ms;
    const objUrl = URL.createObjectURL(ms);
    videoEl.src = objUrl;

    function cleanBuffer() {
      const sb = sbRef.current;
      if (!sb || sb.updating) return;
      try {
        const buf = sb.buffered;
        if (buf.length === 0) return;
        const removeUntil = videoEl.currentTime - 30;
        if (removeUntil > buf.start(0) + 1) sb.remove(buf.start(0), removeUntil);
      } catch {}
    }

    // Drain the pending-data queue into the SourceBuffer
    function processQueue() {
      const sb = sbRef.current;
      if (!sb || sb.updating || queueRef.current.length === 0) return;
      if (ms.readyState !== "open") { queueRef.current = []; return; }
      const data = queueRef.current.shift();
      try {
        sb.appendBuffer(data);
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          queueRef.current.unshift(data);
          cleanBuffer();
        }
        // Any other error: discard chunk and continue
      }
    }

    function stayAtLiveEdge() {
      const sb = sbRef.current;
      if (!sb || sb.updating) return;
      try {
        const buf = sb.buffered;
        if (buf.length === 0) return;
        const edge = buf.end(buf.length - 1);
        // Only snap to live if extremely far behind (>15s). Keep 5s of lookahead.
        // Aggressive seeking is the #1 cause of repeated pause/play cycles — it
        // drops us right at the edge with no buffer, causing immediate underruns.
        if (edge - videoEl.currentTime > 15) {
          videoEl.currentTime = Math.max(edge - 5, buf.start(0));
        }
      } catch {}
    }

    function tryPlay() {
      if (!videoEl.paused) return;
      const sb = sbRef.current;
      if (!sb) return;
      try {
        const buf = sb.buffered;
        if (buf.length === 0) return;
        // 1s threshold — enough to play smoothly without waiting for 2 full chunks
        if (buf.end(buf.length - 1) - buf.start(0) >= 1.0) videoEl.play().catch(() => {});
      } catch {}
    }

    // When the video stalls, don't seek — just let the next fetch refill the buffer.
    // Seeking on "waiting" can jump past data that's already in-flight.
    function handleWaiting() {
      videoEl.play().catch(() => {});
    }

    videoEl.addEventListener("waiting", handleWaiting);

    // Fetch a segment. All fetches start immediately (parallel downloads).
    // The SourceBuffer append is chained in strict seq order so clusters are
    // written correctly even when the network delivers them out of order.
    function schedFetch(seq) {
      // Kick off the HTTP request right now — don't wait for previous fetch
      fetchResultsRef.current.set(
        seq,
        fetch(`${API_BASE_URL}/api/live/${liveId}/segment/${seq}`)
          .then((r) => (r.ok ? r.arrayBuffer().then((b) => new Uint8Array(b)) : null))
          .catch(() => null)
      );
      // Append to SourceBuffer in declaration order (sequential)
      fetchQueueRef.current = fetchQueueRef.current.then(async () => {
        const promise = fetchResultsRef.current.get(seq);
        if (!promise) return;
        const data = await promise;
        fetchResultsRef.current.delete(seq);
        if (!data || !sbRef.current || ms.readyState !== "open") return;
        queueRef.current.push(data);
        processQueue();
      });
    }

    ms.addEventListener("sourceopen", () => {
      try { ms.duration = Infinity; } catch {}

      const es = new EventSource(`${API_BASE_URL}/api/live/${liveId}/stream`);
      esRef.current = es;

      // ── init event: stream started or SSE reconnected ────────
      es.addEventListener("init", async (evt) => {
        try {
          const { mimeType, sequences } = JSON.parse(evt.data);

          if (sbRef.current) {
            // SSE reconnected — SourceBuffer already set up.
            // Fetch any segments we missed during the gap.
            sbReadyRef.current = true;
            setVideoError("");
            const missed = sequences.filter((s) => s > lastSeqRef.current);
            missed.forEach((seq) => {
              lastSeqRef.current = seq;
              schedFetch(seq);
            });
            return;
          }

          if (!MediaSource.isTypeSupported(mimeType)) {
            setVideoError("Browser doesn't support this format. Use Chrome or Firefox.");
            es.close();
            return;
          }

          // Fetch the WebM initialization segment (EBML header + tracks)
          const initResp = await fetch(`${API_BASE_URL}/api/live/${liveId}/init`);
          if (!initResp.ok) { setVideoError("Stream initialisation failed — try refreshing."); return; }
          const initData = new Uint8Array(await initResp.arrayBuffer());

          const sb = ms.addSourceBuffer(mimeType);
          try { sb.mode = "sequence"; } catch {}
          sbRef.current = sb;

          let appendCount = 0;
          sb.addEventListener("updateend", () => {
            processQueue();
            tryPlay();
            stayAtLiveEdge();
            appendCount++;
            if (appendCount % 20 === 0) cleanBuffer();
          });

          // Init data goes first so the SourceBuffer knows the codec/tracks
          queueRef.current.push(initData);
          processQueue();

          sbReadyRef.current = true;
          setStreamStarted(true);

          // Catch up: fetch the most recent available segments (last 5 ≈ 5s)
          const catchup = sequences.slice(-5);
          catchup.forEach((seq) => {
            lastSeqRef.current = seq;
            schedFetch(seq);
          });
        } catch {
          if (!sbRef.current) setVideoError("Failed to initialise stream decoder.");
        }
      });

      // ── segment event: new cluster available, fetch it ───────
      es.addEventListener("segment", (evt) => {
        if (!sbReadyRef.current) return;
        try {
          const { seq } = JSON.parse(evt.data);
          if (seq <= lastSeqRef.current) return; // already scheduled
          lastSeqRef.current = seq;
          schedFetch(seq);
          // Clear any transient error once data is flowing again
          setVideoError((prev) => (prev ? "" : prev));
        } catch {}
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

  // ── Send chat ──────────────────────────────────────────
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
