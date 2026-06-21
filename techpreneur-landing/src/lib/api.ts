// Pricing phases and deadlines based on IST
export interface PricingPhase {
  phase: "upcoming" | "early" | "standard" | "closed";
  label: string;
  amount: number | null;
  originalAmount: number | null;
  deadline: Date | null;
  deadlineLabel: string;
  urgencyText: string;
}

export function getCurrentPricing(): PricingPhase {
  // Make early bird end in the past so the new phase is active NOW
  const earlyBirdEnd  = new Date("2026-05-26T06:00:00Z"); // Past
  const foundingEnd   = new Date("2026-06-03T18:00:00Z"); // Past (End Founder's Batch)
  const standardEnd   = new Date("2026-06-15T18:30:00Z"); // 15 June 2026 (16 June 00:00 IST)

  const now = new Date();

  if (now < earlyBirdEnd) {
    return {
      phase: "early",
      label: "Early Bird Offer",
      amount: 799,
      originalAmount: 5999,
      deadline: earlyBirdEnd,
      deadlineLabel: "Join fast!",
      urgencyText: "⚡ TODAY ONLY — Grab ₹799 before it's gone!",
    };
  }
  
  if (now < foundingEnd) {
    return {
      phase: "founding",
      label: "Founding Batch",
      amount: 1299,
      originalAmount: 5200,
      deadline: foundingEnd,
      deadlineLabel: "FOUNDERS BATCH",
      urgencyText: "⏳ Limited Seats Available",
    };
  }

  if (now < standardEnd) {
    return {
      phase: "late",
      label: "Late Registration Window Open",
      amount: 1499, // Marketing price (GST added at checkout)
      originalAmount: 5200,
      deadline: standardEnd,
      deadlineLabel: "FILLING FAST",
      urgencyText: "🚀 Batch has started — Late Registrations Open!",
    };
  }

  return {
    phase: "closed",
    label: "Program Completed",
    amount: null,
    originalAmount: null,
    deadline: null,
    deadlineLabel: "",
    urgencyText: "TechPreneur 2026 has concluded.",
  };
}

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  trackPreference: string;
  message?: string;
  feeAmount: number;
  registrationPhase: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function createRazorpayOrder(amount: number) {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  const res = await fetch(`${apiUrl}/api/techpreneur/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Failed to create order");
  }
  return res.json();
}

export async function submitRegistration(data: RegistrationPayload) {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  
  const res = await fetch(`${apiUrl}/api/techpreneur/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Registration failed");
  }
  return res.json();
}

export function getInvoiceUrl(registrationId: string) {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  return `${apiUrl}/api/techpreneur/invoice/${registrationId}`;
}

export async function getRegistrationSettings(): Promise<{ registrationOpen: boolean; maintenanceMessage: string }> {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  const res = await fetch(`${apiUrl}/api/techpreneur/settings`);
  if (!res.ok) return { registrationOpen: true, maintenanceMessage: "" };
  return res.json();
}

export interface PreRegisterPayload {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  trackPreference: string;
}

export async function submitPreRegistration(data: PreRegisterPayload) {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  const res = await fetch(`${apiUrl}/api/techpreneur/pre-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Pre-registration failed");
  }
  return res.json();
}

// ─── Referral Code Validation ──────────────────────────────────────────────────
export async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerName?: string; discount?: number; error?: string }> {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  const res = await fetch(`${apiUrl}/api/techpreneur-v2/referrals/validate/${encodeURIComponent(code.toUpperCase())}`);
  return res.json();
}

// ─── Student Dashboard API ─────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";

function studentHeaders() {
  const token = localStorage.getItem("tp_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/sessions`, { headers: studentHeaders() });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function fetchAnnouncements() {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/announcements`, { headers: studentHeaders() });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function fetchMyProject() {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/my`, { headers: studentHeaders() });
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export async function submitProject(data: { githubUrl?: string; driveUrl?: string; projectTitle?: string; description?: string }) {
  // Legacy project submission fallback
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/submit-day`, {
    method: "POST",
    headers: studentHeaders(),
    body: JSON.stringify({ dayNumber: 3, data: { githubUrl: data.githubUrl } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Submission failed");
  }
  return res.json();
}

export async function createTeam(data: { teamName: string; theme: string; customThemeProblem?: string; members?: Array<{ name: string; email: string; techId?: string }> }) {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/create-team`, {
    method: "POST",
    headers: studentHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Team creation failed");
  }
  return res.json();
}

export async function joinTeam(data: { teamCode: string }) {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/join-team`, {
    method: "POST",
    headers: studentHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Joining team failed");
  }
  return res.json();
}

export async function submitDay(dayNumber: number, data: any) {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/submit-day`, {
    method: "POST",
    headers: studentHeaders(),
    body: JSON.stringify({ dayNumber, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `Failed to submit day ${dayNumber}`);
  }
  return res.json();
}

export async function leaveTeam() {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/leave-team`, {
    method: "POST",
    headers: studentHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Failed to leave team");
  }
  return res.json();
}

export async function fetchReferralStats() {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/referrals/my-stats`, { headers: studentHeaders() });
  if (!res.ok) throw new Error("Failed to fetch referral stats");
  return res.json();
}

