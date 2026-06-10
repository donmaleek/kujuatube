import { useEffect, useState } from "react";
import { listSubscriptions, subscribe, unsubscribe } from "../services/subscriptionService.js";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await listSubscriptions();
        if (!cancelled) setSubscriptions(data.subscriptions || data);
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
  }, []);

  async function toggle(channelId, isSubscribed) {
    if (isSubscribed) {
      await unsubscribe(channelId);
      setSubscriptions((items) => items.filter((item) => item.channelId !== channelId));
    } else {
      const created = await subscribe(channelId);
      setSubscriptions((items) => [created, ...items]);
    }
  }

  return { subscriptions, loading, error, toggle };
}
