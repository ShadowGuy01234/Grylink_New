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
  const earlyBirdEnd  = new Date("2026-05-26T06:00:00Z"); // 26 May, 11:30 AM IST (Past)
  const foundingEnd   = new Date("2026-05-27T18:30:00Z"); // 28 May, 12:00 AM IST
  const programEnd    = new Date("2026-06-28T18:30:00Z");

  const now = new Date();

  // If before early bird end (already passed, but kept for logic)
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
      phase: "standard",
      label: "Founding Batch Registrations Now Live",
      amount: 1299,
      originalAmount: 5200,
      deadline: foundingEnd,
      deadlineLabel: "EARLY BIRD SOLD OUT",
      urgencyText: "⏳ Limited Seats Available",
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
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/projects/submit`, {
    method: "POST",
    headers: studentHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Submission failed");
  }
  return res.json();
}

export async function fetchReferralStats() {
  const res = await fetch(`${API_BASE}/api/techpreneur-v2/referrals/my-stats`, { headers: studentHeaders() });
  if (!res.ok) throw new Error("Failed to fetch referral stats");
  return res.json();
}

