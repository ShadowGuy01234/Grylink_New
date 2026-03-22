const SESSION_KEY = "gryork_public_session_id";

function createSessionId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `gs_${Date.now()}_${random}`;
}

export function getSessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = createSessionId();
  localStorage.setItem(SESSION_KEY, next);
  return next;
}
