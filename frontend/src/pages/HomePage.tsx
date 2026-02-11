import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineCurrencyRupee, HiOutlineClipboardCheck, HiOutlineLightningBolt } from 'react-icons/hi';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">GryLink</span>
          </h1>
          <h2 className="hero-subtitle">B2B Supply Chain Financing Platform</h2>
          <p className="hero-description">
            Streamline your business operations with our comprehensive financing solution 
            connecting EPCs and Sub-Contractors seamlessly.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate('/login')}>
              Get Started
            </button>
            <button className="btn-ghost btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineUserGroup />
            </div>
            <h3>Vendor Management</h3>
            <p>Efficiently manage your sub-contractors and maintain comprehensive vendor records.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineClipboardCheck />
            </div>
            <h3>Bill Verification</h3>
            <p>Streamlined bill verification process with automated workflows and quick approvals.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineCurrencyRupee />
            </div>
            <h3>Competitive Bidding</h3>
            <p>Transparent bidding system for optimal financing terms and competitive rates.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineLightningBolt />
            </div>
            <h3>Fast Processing</h3>
            <p>Quick turnaround time from bill submission to fund disbursement.</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Onboarding</h3>
            <p>Sales team creates your account and sends onboarding link</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Documentation</h3>
            <p>Upload required documents and complete KYC</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Bill Submission</h3>
            <p>Sub-contractors upload bills for verification</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Bidding & Funding</h3>
            <p>Receive bids and secure financing terms</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Gryork. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
