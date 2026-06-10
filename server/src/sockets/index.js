import { EventEmitter } from "node:events";

export const socketBus = new EventEmitter();

export function registerSocketHandlers(io) {
  socketBus.on("notification", (payload) => io.emit("notification", payload));
  socketBus.on("view", (payload) => io.emit("view", payload));
}
