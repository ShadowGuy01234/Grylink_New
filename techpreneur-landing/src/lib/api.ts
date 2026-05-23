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
  const earlyBirdEnd  = new Date("2026-05-24T18:29:59Z");
  const programEnd    = new Date("2026-06-28T18:30:00Z");

  const now = new Date();

  if (now < programEnd) {
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
  transactionId: string;
  message?: string;
  feeAmount: number;
  registrationPhase: string;
  screenshot: File;
}

export async function submitRegistration(data: RegistrationPayload) {
  const apiUrl = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";
  
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });

  const res = await fetch(`${apiUrl}/api/techpreneur/register`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Registration failed");
  }
  return res.json();
}
