const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type JsonValue = Record<string, unknown>;

async function post(path: string, body: JsonValue) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "Request failed");
  }
  return data;
}

export const publicApi = {
  submitFeedback: (payload: JsonValue) => post("/public/feedback", payload),
  submitLead: (payload: JsonValue) => post("/public/lead", payload),
  trackEvents: (payload: { events: JsonValue[] }) => post("/public/analytics/events", payload),
  submitCareerApplication: (payload: JsonValue) => post("/careers/apply", payload),
};
