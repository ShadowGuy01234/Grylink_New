import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { grylinkApi } from "../api";
import toast from "react-hot-toast";

const OnboardingPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [linkData, setLinkData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const validate = async () => {
      try {
        if (!token) throw new Error("No token provided");
        const res = await grylinkApi.validate(token);
        setLinkData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await grylinkApi.setPassword(token!, password);
      // Store token for immediate login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Account set up successfully! Redirecting to dashboard...");
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to set password");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="page-loading">Validating your link...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="error-icon">⚠️</div>
            <h1>Link Invalid</h1>
            <p>{error}</p>
          </div>
          <p
            style={{
              marginBottom: 16,
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            If you believe this is an error, please contact your sales
            representative.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary full-width"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>Gryork</span>
          </div>
          <h1>Welcome, {linkData?.ownerName || linkData?.companyName}!</h1>
          <p>Set your password to access your sub-contractor dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={linkData?.email || ""}
              disabled
              className="input-disabled"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary full-width"
            disabled={submitting}
          >
            {submitting ? "Setting up..." : "Set Password & Continue"}
          </button>
        </form>
        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
