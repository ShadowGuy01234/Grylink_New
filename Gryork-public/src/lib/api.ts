export type ApiSubmitResult = {
  ok: boolean;
  message?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function postJson(path: string, payload: unknown): Promise<ApiSubmitResult> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error?: string }).error)
        : "Request failed";
    throw new Error(message);
  }

  const message =
    typeof data === "object" && data && "message" in data
      ? String((data as { message?: string }).message)
      : undefined;
  return { ok: true, message };
}
