import { useCallback, useEffect, useState } from "react";
import { addComment, listComments } from "../services/commentService.js";

export function useComments(videoId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(Boolean(videoId));
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!videoId) return [];
    const data = await listComments(videoId);
    setComments(data.comments || data);
    return data.comments || data;
  }, [videoId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await listComments(videoId);
        if (!cancelled) setComments(data.comments || data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (videoId) load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const submitComment = useCallback(
    async (body) => {
      const created = await addComment(videoId, body);
      setComments((current) => [created, ...current]);
      return created;
    },
    [videoId]
  );

  return { comments, loading, error, refresh, submitComment };
}
