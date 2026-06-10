import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export const PlayerContext = createContext(null);

const defaultPlaybackState = {
  currentTime: 0,
  duration: 0,
  playing: false,
  volume: 0.82,
  muted: false,
  speed: 1,
  loop: true
};

export function PlayerProvider({ children }) {
  // Main player state — owned by VideoPlayer via syncPlayback
  const [activeVideo, setActiveVideo] = useState(null);
  const [playbackState, setPlaybackState] = useState(defaultPlaybackState);

  // Mini player state — set by openMiniPlayer, owned by MiniPlayer via syncMiniPlayback
  const [miniVideo, setMiniVideo] = useState(null);
  const [miniPlaybackState, setMiniPlaybackState] = useState(defaultPlaybackState);
  const [isMiniPlayerOpen, setMiniPlayerOpen] = useState(false);

  // Refs so syncPlayback / openMiniPlayer can read current mini state without stale closures
  const miniPlayerOpenRef = useRef(false);
  const miniVideoRef = useRef(null);
  useEffect(() => { miniPlayerOpenRef.current = isMiniPlayerOpen; }, [isMiniPlayerOpen]);
  useEffect(() => { miniVideoRef.current = miniVideo; }, [miniVideo]);

  // Main player sync — VideoPlayer calls this on every timeupdate
  const syncPlayback = useCallback((video, nextState = {}) => {
    if (video) {
      setActiveVideo(video);
      // Enforce single-video rule: if a different video starts playing in main player, stop mini player
      if (miniPlayerOpenRef.current && miniVideoRef.current?.id && miniVideoRef.current.id !== video.id && nextState.playing) {
        setMiniPlayerOpen(false);
        setMiniPlaybackState((s) => ({ ...s, playing: false }));
      }
    }
    setPlaybackState((state) => ({ ...state, ...nextState }));
  }, []);

  // Mini player sync — MiniPlayer calls this to track its own progress
  const syncMiniPlayback = useCallback((video, nextState = {}) => {
    if (video) setMiniVideo(video);
    setMiniPlaybackState((state) => ({ ...state, ...nextState }));
  }, []);

  // Push the current video to the mini player (called from VideoPlayer button or App navigate or Watch scroll)
  const openMiniPlayer = useCallback((video, nextState = {}) => {
    if (!video) return;
    setMiniVideo(video);
    setMiniPlaybackState((state) => ({
      ...defaultPlaybackState,
      ...state,
      ...nextState,
      playing: nextState.playing ?? state.playing ?? true
    }));
    setMiniPlayerOpen(true);
  }, []);

  // Close and stop — user clicked X
  const closeMiniPlayer = useCallback(() => {
    setMiniPlayerOpen(false);
    setMiniPlaybackState((state) => ({ ...state, playing: false }));
  }, []);

  // Hide without stopping — used when main player regains visibility
  const hideMiniPlayer = useCallback((resumeState = {}) => {
    setMiniPlayerOpen(false);
    if (Object.keys(resumeState).length > 0) {
      // Carry mini player's current time back to main playback state so VideoPlayer can resume
      setPlaybackState((state) => ({ ...state, ...resumeState }));
    }
  }, []);

  const value = useMemo(
    () => ({
      activeVideo,
      closeMiniPlayer,
      hideMiniPlayer,
      isMiniPlayerOpen,
      miniPlaybackState,
      miniVideo,
      openMiniPlayer,
      playbackState,
      syncMiniPlayback,
      syncPlayback
    }),
    [activeVideo, closeMiniPlayer, hideMiniPlayer, isMiniPlayerOpen, miniPlaybackState, miniVideo, openMiniPlayer, playbackState, syncMiniPlayback, syncPlayback]
  );

  return createElement(PlayerContext.Provider, { value }, children);
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
