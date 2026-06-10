import { useEffect, useState } from "react";
import { getVideo, listVideos } from "../services/videoService.js";

export function useVideos(params = {}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await listVideos(params);
        if (!cancelled) setVideos(data.videos || data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(params)]);

  return { videos, loading, error, setVideos };
}

export function useVideo(videoId) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(Boolean(videoId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getVideo(videoId);
        if (!cancelled) setVideo(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return { video, loading, error, setVideo };
}
