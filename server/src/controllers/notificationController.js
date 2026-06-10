import { listNotifications, markAllRead } from "../services/notificationService.js";

export function notificationsIndex(req, res) {
  return res.json({ notifications: listNotifications(req.user.id) });
}

export function notificationsReadAll(req, res) {
  markAllRead(req.user.id);
  return res.json({ ok: true });
}
