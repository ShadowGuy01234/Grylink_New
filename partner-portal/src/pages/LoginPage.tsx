import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const publicSiteUrl =
    import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5176";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <span>Gryork</span>
          </div>
          <h1>Partner Portal</h1>
          <p>Sign in to your EPC or NBFC partner account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="company@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            New partner?{" "}
            <a
              href={`${publicSiteUrl}/for-epc`}
              style={{ color: "var(--accent)" }}
            >
              Learn more about partnering with Gryork
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
