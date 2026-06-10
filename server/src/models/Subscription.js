export function createSubscriptionModel({ id, userId, channelId, channelName = "" }) {
  return {
    id,
    userId,
    channelId,
    channelName,
    createdAt: new Date().toISOString()
  };
}
