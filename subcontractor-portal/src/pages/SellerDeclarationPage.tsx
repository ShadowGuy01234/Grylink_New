import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scApi } from "../api";
import toast from "react-hot-toast";

const SellerDeclarationPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declarationStatus, setDeclarationStatus] = useState<{
    accepted: boolean;
    acceptedAt?: string;
  } | null>(null);
  const [checkboxes, setCheckboxes] = useState({
    accuracy: false,
    authorization: false,
    compliance: false,
    acknowledgment: false,
  });

  useEffect(() => {
    checkDeclarationStatus();
  }, []);

  const checkDeclarationStatus = async () => {
    try {
      const res = await scApi.getDeclarationStatus();
      setDeclarationStatus({
        accepted: res.data.declarationAccepted || false,
        acceptedAt: res.data.declarationAcceptedAt,
      });
    } catch (err) {
      console.error("Failed to check declaration status");
    } finally {
      setLoading(false);
    }
  };

  const allChecked = Object.values(checkboxes).every((v) => v);

  const handleAccept = async () => {
    if (!allChecked) {
      toast.error("Please accept all terms to continue");
      return;
    }

    setAccepting(true);
    try {
      await scApi.acceptDeclaration();
      toast.success("Declaration accepted successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept declaration");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (declarationStatus?.accepted) {
    return (
      <div className="declaration-page">
        <div className="declaration-success">
          <div className="success-icon">✓</div>
          <h2>Declaration Already Accepted</h2>
          <p>
            You accepted the seller declaration on{" "}
            {new Date(declarationStatus.acceptedAt!).toLocaleDateString()}
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="declaration-page">
      <div className="declaration-container">
        <div className="declaration-header">
          <h1>Seller Declaration</h1>
          <p className="subtitle">Step 4 of Onboarding (Mandatory)</p>
          <div className="hard-gate-notice">
            <span className="notice-icon">⚠️</span>
            <span>
              This is a mandatory step. You cannot submit CWCRF without
              accepting this declaration.
            </span>
          </div>
        </div>

        <div className="declaration-content">
          <div className="declaration-section">
            <h3>1. Information Accuracy</h3>
            <p>
              I, the undersigned, hereby declare that all information provided
              by me in this platform, including but not limited to company
              details, personal identification, bank account information, and
              all invoices/bills submitted, is true, accurate, and complete to
              the best of my knowledge.
            </p>
            <p>
              I understand that any false, misleading, or fraudulent information
              may result in immediate termination of services and may lead to
              legal action.
            </p>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={checkboxes.accuracy}
                onChange={(e) =>
                  setCheckboxes((prev) => ({
                    ...prev,
                    accuracy: e.target.checked,
                  }))
                }
              />
              <span>I confirm the accuracy of all information provided</span>
            </label>
          </div>

          <div className="declaration-section">
            <h3>2. Authorization & Consent</h3>
            <p>I hereby authorize Gryork Platform to:</p>
            <ul>
              <li>
                Verify my identity and business credentials through third-party
                verification services
              </li>
              <li>
                Share my profile and invoice details with registered NBFC
                partners for the purpose of bill discounting quotations
              </li>
              <li>
                Contact me regarding platform updates, offers, and
                service-related communications
              </li>
              <li>
                Store and process my data in accordance with the platform's
                privacy policy
              </li>
            </ul>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={checkboxes.authorization}
                onChange={(e) =>
                  setCheckboxes((prev) => ({
                    ...prev,
                    authorization: e.target.checked,
                  }))
                }
              />
              <span>
                I authorize Gryork to process and share my data as described
              </span>
            </label>
          </div>

          <div className="declaration-section">
            <h3>3. Compliance Commitment</h3>
            <p>I acknowledge and agree to:</p>
            <ul>
              <li>
                Comply with all applicable laws and regulations related to
                invoice financing and bill discounting
              </li>
              <li>
                Not engage in any fraudulent, illegal, or unethical activities
                on this platform
              </li>
              <li>
                Submit only genuine invoices for work actually completed and
                accepted by the buyer
              </li>
              <li>Not submit duplicate invoices or fake documents</li>
              <li>
                Inform Gryork immediately if any submitted information changes
                or becomes outdated
              </li>
            </ul>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={checkboxes.compliance}
                onChange={(e) =>
                  setCheckboxes((prev) => ({
                    ...prev,
                    compliance: e.target.checked,
                  }))
                }
              />
              <span>
                I commit to compliance with all platform rules and regulations
              </span>
            </label>
          </div>

          <div className="declaration-section">
            <h3>4. Risk Acknowledgment</h3>
            <p>I understand and acknowledge that:</p>
            <ul>
              <li>
                Bill discounting decisions are made by NBFC partners, not by
                Gryork
              </li>
              <li>
                Interest rates and terms are determined by NBFCs based on their
                risk assessment
              </li>
              <li>
                Gryork acts as a facilitator and does not guarantee loan
                approval
              </li>
              <li>
                I am responsible for repaying any funds disbursed according to
                the agreed terms
              </li>
              <li>
                Default on repayment may affect my credit score and lead to
                legal action
              </li>
            </ul>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={checkboxes.acknowledgment}
                onChange={(e) =>
                  setCheckboxes((prev) => ({
                    ...prev,
                    acknowledgment: e.target.checked,
                  }))
                }
              />
              <span>I acknowledge and accept the risks involved</span>
            </label>
          </div>

          <div className="declaration-summary">
            <h3>Summary</h3>
            <p>
              By clicking "Accept Declaration" below, I confirm that I have
              read, understood, and agree to all the terms mentioned above. This
              declaration shall be legally binding and shall remain in effect
              for all transactions conducted through the Gryork platform.
            </p>
          </div>
        </div>

        <div className="declaration-actions">
          <button onClick={() => navigate("/")} className="btn-secondary">
            Back to Dashboard
          </button>
          <button
            onClick={handleAccept}
            className="btn-primary"
            disabled={!allChecked || accepting}
          >
            {accepting ? "Processing..." : "Accept Declaration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDeclarationPage;
