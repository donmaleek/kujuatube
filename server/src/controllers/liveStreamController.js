// roomId → { mimeType, initChunk, chunks[], nextSeq, clients, chatClients, messages, title, channelName, createdAt }
const rooms = new Map();
const MAX_CHUNKS = 120; // ~60 seconds at 2 chunks/sec (500ms MediaRecorder timeslice)

export function ensureRoom(liveId, meta = {}) {
  if (!rooms.has(liveId)) {
    rooms.set(liveId, {
      mimeType: "video/webm;codecs=vp8,opus",
      initChunk: null,
      chunks: [],
      nextSeq: 0,
      clients: new Set(),
      chatClients: new Set(),
      messages: [],
      title: meta.title || "Live stream",
      channelName: meta.channelName || "Creator",
      createdAt: new Date().toISOString()
    });
  } else {
    const room = rooms.get(liveId);
    if (meta.title) room.title = meta.title;
    if (meta.channelName) room.channelName = meta.channelName;
  }
  return rooms.get(liveId);
}

// ─── Video stream ───────────────────────────────────────

export function streamInfo(req, res) {
  const room = rooms.get(req.params.liveId);
  if (!room) return res.json({ live: false, viewerCount: 0, chatCount: 0, title: "", channelName: "" });
  return res.json({
    live: Boolean(room.initChunk),
    viewerCount: room.clients.size,
    chatCount: room.chatClients.size,
    title: room.title,
    channelName: room.channelName,
    mimeType: room.mimeType
  });
}

// GET /api/live/:liveId/init — WebM initialization segment (EBML header + tracks)
export function streamInitSegment(req, res) {
  const room = rooms.get(req.params.liveId);
  if (!room?.initChunk) return res.status(404).json({ error: "No stream" });
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.end(room.initChunk);
}

// GET /api/live/:liveId/segment/:seq — single WebM cluster
export function streamSegment(req, res) {
  const room = rooms.get(req.params.liveId);
  if (!room) return res.status(404).json({ error: "No stream" });
  const seq = parseInt(req.params.seq, 10);
  const chunk = room.chunks.find((c) => c.seq === seq);
  if (!chunk) return res.status(404).json({ error: "Segment not found" });
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.end(chunk.data);
}

// SSE: lightweight segment-ID notifications only — no binary data in the SSE stream
export function streamSubscribe(req, res) {
  const room = ensureRoom(req.params.liveId);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(": connected\n\n");

  // If stream is already live, catch up the new subscriber immediately
  if (room.initChunk) {
    const sequences = room.chunks.map((c) => c.seq);
    res.write(`event: init\ndata: ${JSON.stringify({ mimeType: room.mimeType, sequences })}\n\n`);
  }

  // Keep connection alive through proxies that time out idle SSE
  const hb = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(hb); }
  }, 20_000);

  room.clients.add(res);
  req.on("close", () => { room.clients.delete(res); clearInterval(hb); });
}

// POST /api/live/:liveId/chunk — broadcaster pushes a media chunk
export function streamChunk(req, res) {
  const { liveId } = req.params;
  const chunk = req.body;

  if (!Buffer.isBuffer(chunk) || chunk.length === 0) {
    return res.status(400).json({ error: "Empty chunk" });
  }

  const mimeType = req.headers["x-mime-type"] || "video/webm;codecs=vp8,opus";
  const room = ensureRoom(liveId, {
    title: req.headers["x-title"],
    channelName: req.headers["x-channel"]
  });

  if (!room.initChunk) {
    // First chunk is the WebM initialization segment — store separately
    room.mimeType = mimeType;
    room.initChunk = chunk;
    // Tell any viewers already waiting that the stream has started
    const payload = JSON.stringify({ mimeType, sequences: [] });
    for (const client of room.clients) {
      try { client.write(`event: init\ndata: ${payload}\n\n`); } catch {}
    }
    return res.json({ ok: true, viewers: room.clients.size, seq: -1 });
  }

  // Every subsequent chunk is a WebM cluster — assign a sequence number
  const seq = room.nextSeq++;
  room.chunks.push({ seq, data: chunk });
  if (room.chunks.length > MAX_CHUNKS) room.chunks.shift();

  // Notify viewers with only the sequence number — they fetch the data themselves
  const payload = JSON.stringify({ seq });
  for (const client of room.clients) {
    try { client.write(`event: segment\ndata: ${payload}\n\n`); } catch {}
  }

  return res.json({ ok: true, viewers: room.clients.size, seq });
}

export function streamEnd(req, res) {
  const room = rooms.get(req.params.liveId);
  if (room) {
    for (const client of room.clients) {
      try { client.write("event: ended\ndata: {}\n\n"); client.end(); } catch {}
    }
    for (const client of room.chatClients) {
      try { client.write("event: ended\ndata: {}\n\n"); client.end(); } catch {}
    }
    rooms.delete(req.params.liveId);
  }
  return res.json({ ok: true });
}

// ─── Live chat ───────────────────────────────────────────

export function chatSubscribe(req, res) {
  const room = ensureRoom(req.params.liveId);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(": connected\n\n");

  // Replay last 50 messages to late joiners
  for (const msg of room.messages.slice(-50)) {
    res.write(`event: message\ndata: ${JSON.stringify(msg)}\n\n`);
  }

  const hb = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(hb); }
  }, 20_000);

  room.chatClients.add(res);
  req.on("close", () => { room.chatClients.delete(res); clearInterval(hb); });
}

export function chatSend(req, res) {
  const { liveId } = req.params;
  const text = String(req.body?.text || "").trim();

  if (!text) return res.status(400).json({ error: "Message required" });
  if (text.length > 200) return res.status(400).json({ error: "Too long" });

  const room = ensureRoom(liveId);
  const displayName = String(req.user?.name || req.body?.displayName || "Viewer").slice(0, 32).trim() || "Viewer";

  const msg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    displayName,
    userId: req.user?.id || null,
    text,
    timestamp: new Date().toISOString()
  };

  room.messages.push(msg);
  if (room.messages.length > 100) room.messages.shift();

  const data = JSON.stringify(msg);
  for (const client of room.chatClients) {
    try { client.write(`event: message\ndata: ${data}\n\n`); } catch {}
  }

  return res.json({ ok: true, message: msg });
}
