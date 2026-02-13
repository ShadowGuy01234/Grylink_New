import { 
  ArrowRight, 
  Shield, 
  Clock, 
  Banknote,
  Building2,
  FileCheck,
  Users,
  Zap,
  CheckCircle2
} from 'lucide-react';

const HomePage = () => {
  const steps = [
    {
      number: 1,
      title: 'Receive Invitation',
      description: 'Sales rep sends you a personalized GryLink invitation email',
      icon: Zap,
      color: '#3b82f6'
    },
    {
      number: 2,
      title: 'Set Up Account',
      description: 'Click the link and create your secure password',
      icon: Shield,
      color: '#8b5cf6'
    },
    {
      number: 3,
      title: 'Upload Documents',
      description: 'Submit company documents for verification',
      icon: FileCheck,
      color: '#22c55e'
    },
    {
      number: 4,
      title: 'Start Trading',
      description: 'Access partner portal and begin transactions',
      icon: Banknote,
      color: '#f59e0b'
    }
  ];

  const benefits = [
    {
      title: 'Fast Liquidity',
      description: 'Get paid within 48 hours instead of waiting 90+ days',
      icon: Clock
    },
    {
      title: 'Secure Platform',
      description: 'Bank-grade security with encrypted document handling',
      icon: Shield
    },
    {
      title: 'Trusted Partners',
      description: 'Verified EPCs and regulated NBFCs on our platform',
      icon: Building2
    },
    {
      title: 'Expert Support',
      description: 'Dedicated relationship managers for smooth operations',
      icon: Users
    }
  ];

  const roles = [
    {
      id: 'epc',
      title: 'EPC Company',
      description: 'Large construction firms managing sub-contractor payments',
      features: ['Add & validate sub-contractors', 'Place bids on invoices', 'Streamline payment cycles']
    },
    {
      id: 'nbfc',
      title: 'NBFC Partner',
      description: 'Financial institutions providing invoice financing',
      features: ['Review verified cases', 'Set competitive terms', 'Secure disbursement']
    }
  ];

  return (
    <div className="grylink-home">
      {/* Navigation */}
      <nav className="grylink-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">GryLink</span>
            <span className="logo-badge">by Gryork</span>
          </div>
          <div className="nav-actions">
            <a href="https://gryork.com" className="nav-link">About Gryork</a>
            <a href="mailto:support@gryork.com" className="nav-link">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grylink-hero">
        <div className="hero-bg"></div>
        <div className="hero-container">
          <div className="hero-badge-wrapper">
            <span className="hero-badge">
              <Zap size={14} />
              One-Click Onboarding
            </span>
          </div>
          <h1>
            Your Gateway to <br />
            <span className="gradient-text">Bill Discounting</span>
          </h1>
          <p>
            GryLink is the secure onboarding portal for EPCs and NBFCs 
            joining the Gryork platform. Start your journey in minutes.
          </p>
          <div className="hero-cta">
            <a href="mailto:sales@gryork.com" className="btn-primary">
              Request Access
              <ArrowRight size={18} />
            </a>
            <a href="#how-it-works" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="grylink-steps" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2>How GryLink Works</h2>
            <p>Get onboarded in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={step.number} className="step-card">
                <div className="step-connector" style={{ display: index === steps.length - 1 ? 'none' : 'block' }}></div>
                <div className="step-number" style={{ background: step.color }}>
                  {step.number}
                </div>
                <div className="step-icon" style={{ background: `${step.color}15`, color: step.color }}>
                  <step.icon size={24} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="grylink-roles">
        <div className="section-container">
          <div className="section-header">
            <h2>Who Uses GryLink?</h2>
            <p>Tailored onboarding for different partner types</p>
          </div>
          <div className="roles-grid">
            {roles.map((role) => (
              <div key={role.id} className="role-card">
                <div className="role-header">
                  <Building2 size={28} />
                  <h3>{role.title}</h3>
                </div>
                <p>{role.description}</p>
                <ul className="role-features">
                  {role.features.map((feature, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="grylink-benefits">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Choose Gryork?</h2>
            <p>The smart way to manage construction payments</p>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, i) => (
              <div key={i} className="benefit-card">
                <div className="benefit-icon">
                  <benefit.icon size={24} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Already Have Link */}
      <section className="grylink-existing">
        <div className="section-container">
          <div className="existing-card">
            <div className="existing-content">
              <h3>Already have an invitation link?</h3>
              <p>Click the link in your email to complete your onboarding. If you've lost your link, contact your sales representative.</p>
            </div>
            <div className="existing-actions">
              <a href="mailto:support@gryork.com" className="btn-outline">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="grylink-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">GryLink</span>
            <p>Secure onboarding portal by Gryork Technologies</p>
          </div>
          <div className="footer-links">
            <a href="https://gryork.com/privacy">Privacy Policy</a>
            <a href="https://gryork.com/terms">Terms of Service</a>
            <a href="mailto:support@gryork.com">Support</a>
          </div>
          <div className="footer-copyright">
            <p>© 2026 Gryork Technologies Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
