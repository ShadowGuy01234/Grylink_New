import React from 'react';
import { Building, Landmark, Target, ArrowRight, ShieldCheck, Phone, GitPullRequest, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FPDF_FULL_FORM } from '../constants/discoveryLabels';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-wrapper">
      <div className="homepage-hero">
        <h1 className="hero-title">Gryork Discovery Framework</h1>
        <p className="hero-subtitle">
          The central hub for identifying, qualifying, and converting 
          Strategic Partners (EPCs) and Financial Institutions (NBFCs).
        </p>
      </div>

      <div className="frameworks-grid">
        {/* BDF Card */}
        <div className="framework-card bdf-wrap">
          <div className="fc-header" style={{ borderColor: 'var(--color-gryork-blue)' }}>
            <div className="fc-icon"><Building size={32} color="var(--color-gryork-blue)" /></div>
            <h2>BDF Pipeline</h2>
            <span>Business Discovery Framework</span>
          </div>
          <p className="fc-desc">Qualify EPC companies and project developers by assessing their financing needs, ground realities, and execution capabilities.</p>
          
          <div className="process-flow">
            <div className="flow-step">
               <Search size={18}/> Project Fit
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step">
              <Phone size={18}/> Outreach
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step">
              <Target size={18}/> Ground Intel
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step final-step">
              <Zap size={18}/> Scoring
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/bdf/new')} style={{ width: '100%', marginTop: 24, padding: '14px', fontSize: 15 }}>
             Start BDF Entry →
          </button>
        </div>

        {/* FPDF Card */}
        <div className="framework-card fpdf-wrap">
          <div className="fc-header" style={{ borderColor: 'var(--color-green-accent)' }}>
            <div className="fc-icon"><Landmark size={32} color="var(--color-green-accent)" /></div>
            <h2>FPDF Pipeline</h2>
            <span>{FPDF_FULL_FORM}</span>
          </div>
          <p className="fc-desc">Identify and onboard NBFCs, Banks, and Fintech lenders looking to disburse capital via the Grylink LSP network.</p>

          <div className="process-flow">
            <div className="flow-step">
               <ShieldCheck size={18}/> Lending Match
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step">
              <GitPullRequest size={18}/> Omnichannel
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step">
              <Target size={18}/> Engagement
            </div>
            <ArrowRight size={16} className="flow-arrow" />
             <div className="flow-step final-step-alt">
              <Zap size={18}/> Conversion
            </div>
          </div>

          <button className="btn btn-success" onClick={() => navigate('/fpdf/new')} style={{ width: '100%', marginTop: 24, padding: '14px', fontSize: 15 }}>
             Start FPDF Entry →
          </button>
        </div>
      </div>
      
      <div className="system-architecture-footer">
        <h3>System Operations</h3>
        <p>Both frameworks feed into a centralized <strong>Conversion Meter</strong>. Prospects entering the <strong style={{color: '#22c55e'}}>GREEN (Priority)</strong> or <strong style={{color: '#eab308'}}>YELLOW (Strategic)</strong> zones will be cleared for direct API conversion into active Grylink Platform entities, automatically notifying the founder desk and generating credentials.</p>
      </div>
    </div>
  );
};

export default HomePage;
