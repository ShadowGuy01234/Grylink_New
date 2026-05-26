import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://grylink-backend.vercel.app";

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  track: string;
  status: string;
  paymentVerified: boolean;
  dashboardAccess: boolean;
  referralCode?: string;
  createdAt: string;
}

interface StudentAuthContextType {
  student: StudentProfile | null;
  token: string | null;
  loading: boolean;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | null>(null);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("tp_token");
    if (savedToken) {
      setToken(savedToken);
      fetch(`${API_BASE}/api/techpreneur/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.student) {
            setStudent({
              ...data.student,
              track: data.student.trackPreference || data.student.track,
            });
          } else {
            localStorage.removeItem("tp_token");
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("tp_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const sendOTP = async (email: string) => {
    const res = await fetch(`${API_BASE}/api/techpreneur/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
  };

  const verifyOTP = async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE}/api/techpreneur/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");

    localStorage.setItem("tp_token", data.token);
    setToken(data.token);
    setStudent({
      ...data.student,
      track: data.student.track || data.student.trackPreference,
    });
  };

  const logout = () => {
    localStorage.removeItem("tp_token");
    setToken(null);
    setStudent(null);
  };

  return (
    <StudentAuthContext.Provider value={{ student, token, loading, sendOTP, verifyOTP, logout }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used inside StudentAuthProvider");
  return ctx;
}
