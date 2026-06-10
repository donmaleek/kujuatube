import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kujuatime.history";

export function useWatchHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  }, []);

  const addToHistory = useCallback((video) => {
    setHistory((current) => {
      const next = [
        { ...video, watchedAt: new Date().toISOString() },
        ...current.filter((item) => item.id !== video.id)
      ].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
