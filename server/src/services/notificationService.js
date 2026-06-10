import { db, persistDb } from "../config/database.js";

export function queueNotification(notification) {
  if (!db.notifications) db.notifications = [];
  const created = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification
  };
  db.notifications.unshift(created);
  if (db.notifications.length > 200) db.notifications.length = 200;
  persistDb();
  return created;
}

export function listNotifications(userId) {
  return (db.notifications || []).filter((n) => n.userId === userId);
}

export function markAllRead(userId) {
  (db.notifications || []).forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  persistDb();
}
