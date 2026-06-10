export function createReportModel({ id, userId, videoId, reason, notes = "" }) {
  const timestamp = new Date().toISOString();
  return {
    id,
    userId,
    videoId,
    reason,
    notes,
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
