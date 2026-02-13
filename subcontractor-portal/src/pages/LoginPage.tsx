import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api";

type Step = "email" | "not-found" | "create-password" | "login";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [nameFromEpc, setNameFromEpc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedEpc, setLinkedEpc] = useState("");

  const publicSiteUrl =
    import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5176";

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.checkEmail(email.trim().toLowerCase());
      const data = res.data;

      if (!data.found) {
        setStep("not-found");
      } else if (data.hasAccount) {
        setStep("login");
      } else {
        setLinkedEpc(data.linkedEpc || "your EPC company");
        // Pre-fill name from EPC data if available
        if (data.contactName) {
          setName(data.contactName);
          setNameFromEpc(true);
        }
        setStep("create-password");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to check email");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerSubcontractor({
        name: name.trim() || email.split("@")[0],
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("token", res.data.token);
      toast.success("Account created successfully!");
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>Gryork</span>
          </div>
          <h1>Sub-Contractor Portal</h1>
          <p>Sign in to manage your bills and payments</p>
        </div>

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleCheckEmail} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 2a: Email Not Found */}
        {step === "not-found" && (
          <div className="auth-form">
            <div className="info-box error">
              <div className="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="info-content">
                <h3>Email Not Found</h3>
                <p>
                  The email <strong>{email}</strong> is not registered in our
                  system.
                </p>
                <p style={{ marginTop: 12 }}>
                  Please contact your EPC company to add you as a sub-contractor
                  vendor first.
                </p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="btn-secondary full-width"
              style={{ marginTop: 16 }}
            >
              Try Another Email
            </button>
          </div>
        )}

        {/* Step 2b: Create Password (First Time) */}
        {step === "create-password" && (
          <form onSubmit={handleCreatePassword} className="auth-form">
            <div className="info-box success">
              <div className="info-content">
                <h3>Welcome!</h3>
                <p>
                  You've been added by <strong>{linkedEpc}</strong>. Create a
                  password to access your account.
                </p>
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">
                Your Name{nameFromEpc ? "" : " (Optional)"}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => !nameFromEpc && setName(e.target.value)}
                placeholder="John Doe"
                className={nameFromEpc ? "input-disabled" : ""}
                readOnly={nameFromEpc}
              />
              {nameFromEpc && (
                <small
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Name provided by {linkedEpc}
                </small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="btn-link"
              style={{ marginTop: 12 }}
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Step 2c: Login with Password */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="btn-link"
              style={{ marginTop: 12 }}
            >
              Use a different email
            </button>
          </form>
        )}

        {step === "email" && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              <a
                href={`${publicSiteUrl}/for-subcontractors`}
                style={{ color: "var(--accent)" }}
              >
                Learn more about Gryork for Sub-Contractors
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
