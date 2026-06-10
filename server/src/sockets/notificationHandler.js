import { socketBus } from "./index.js";

export function publishNotification(notification) {
  socketBus.emit("notification", {
    ...notification,
    emittedAt: new Date().toISOString()
  });
}
