const outbox = [];

export function queueEmail({ to, subject, body }) {
  const email = {
    id: `email-${Date.now()}`,
    to,
    subject,
    body,
    status: "queued",
    createdAt: new Date().toISOString()
  };
  outbox.push(email);
  return email;
}

export function getOutbox() {
  return [...outbox];
}
