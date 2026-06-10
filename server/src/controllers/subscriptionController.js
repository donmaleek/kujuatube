import { createId, db, findUserById, persistDb } from "../config/database.js";
import { createSubscriptionModel } from "../models/Subscription.js";
import { HttpError, sendCreated } from "../utils/http.js";

export function index(req, res) {
  const subscriptions = db.subscriptions
    .filter((item) => item.userId === req.user.id)
    .map((item) => {
      const channel = findUserById(item.channelId);
      return { ...item, avatarUrl: channel?.avatarUrl || "" };
    });
  return res.json({ subscriptions });
}

export function store(req, res) {
  const { channelId } = req.body;
  const channel = findUserById(channelId);
  if (!channel) throw new HttpError(404, "Channel not found");

  const existing = db.subscriptions.find((item) => item.userId === req.user.id && item.channelId === channelId);
  if (existing) return res.json(existing);

  const subscription = createSubscriptionModel({
    id: createId("subscription"),
    userId: req.user.id,
    channelId,
    channelName: channel.name
  });
  db.subscriptions.push(subscription);
  persistDb();

  return sendCreated(res, subscription);
}

export function destroy(req, res) {
  const indexToRemove = db.subscriptions.findIndex(
    (item) => item.userId === req.user.id && item.channelId === req.params.channelId
  );
  if (indexToRemove !== -1) db.subscriptions.splice(indexToRemove, 1);
  persistDb();
  return res.status(204).send();
}
