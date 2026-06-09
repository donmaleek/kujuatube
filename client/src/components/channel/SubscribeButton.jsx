import { useEffect, useState } from "react";
import { subscribe, unsubscribe, listSubscriptions } from "../../services/subscriptionService.js";
import { getAuthToken } from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function SubscribeButton({ channelId }) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!channelId || !getAuthToken()) { setReady(true); return; }
    listSubscriptions()
      .then((data) => {
        const subs = data.subscriptions || data || [];
        setSubscribed(subs.some((s) => s.channelId === channelId));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [channelId]);

  async function toggle() {
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    setSaving(true);
    try {
      if (subscribed) {
        await unsubscribe(channelId);
        setSubscribed(false);
      } else {
        await subscribe(channelId);
        setSubscribed(true);
      }
    } catch {}
    setSaving(false);
  }

  if (!ready) return null;

  return (
    <button className={subscribed ? "button selected" : "button primary"} onClick={toggle} disabled={saving}>
      {saving ? "Saving…" : subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
