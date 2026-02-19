import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { SubContractor } from "../../types";

interface SubContractorsSectionProps {
  subContractors: SubContractor[];
  onAddSingle: (data: any) => Promise<void>;
  onBulkUpload: (file: File) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
}

export const SubContractorsSection: React.FC<SubContractorsSectionProps> = ({
  subContractors,
  onAddSingle,
  onBulkUpload,
  onDelete,
}) => {
  const [showAddSC, setShowAddSC] = React.useState(false);
  const [showBulkDialog, setShowBulkDialog] = React.useState(false);
  const [scForm, setScForm] = React.useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [addingSC, setAddingSC] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSC(true);
    try {
      await onAddSingle(scForm);
      setShowAddSC(false);
      setScForm({ companyName: "", contactName: "", email: "", phone: "" });
    } finally {
      setAddingSC(false);
    }
  };

  const handleExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowBulkDialog(false);
      await onBulkUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        companyName: "Example Pvt Ltd",
        contactName: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sub-Contractors");
    XLSX.writeFile(wb, "subcontractor_template.xlsx");
    toast.success("Template downloaded! Fill it and upload.");
  };

  return (
    <motion.div
      key="subcontractors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="section"
    >
      <div className="section-header">
        <div>
          <h2>Sub-Contractor Management</h2>
          <p className="section-subtitle">
            Add and manage your sub-contractors here
          </p>
        </div>
        <div className="header-actions">
          {/* Bulk Upload — opens dialog first */}
          <button
            onClick={() => setShowBulkDialog(true)}
            className="btn-outline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Bulk Upload
          </button>

          {/* Hidden file input, triggered after dialog */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelChange}
            style={{ display: "none" }}
            accept=".xlsx,.xls,.csv"
          />

          <button
            onClick={() => setShowAddSC((v) => !v)}
            className="btn-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* ── Bulk Upload Dialog ── */}
      <AnimatePresence>
        {showBulkDialog && (
          <div
            className="modal-overlay"
            onClick={() => setShowBulkDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#4f46e5,#0ea5e9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    Bulk Upload Sub-Contractors
                  </h3>
                  <p
                    style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}
                  >
                    Use the Excel template for correct formatting
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#475569",
                  lineHeight: 1.6,
                  margin: "0 0 20px",
                }}
              >
                Download the template, fill in your sub-contractors' details,
                then upload the completed file. The file must contain columns:{" "}
                <strong>companyName, contactName, email, phone</strong>.
              </p>

              {/* Step 1 — Download Template */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "#1e293b",
                        fontSize: "0.875rem",
                      }}
                    >
                      Step 1 — Download Template
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.78rem",
                        color: "#64748b",
                      }}
                    >
                      subcontractor_template.xlsx
                    </p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="btn-outline"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              {/* Step 2 — Upload File */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "#1e293b",
                        fontSize: "0.875rem",
                      }}
                    >
                      Step 2 — Upload Filled File
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.78rem",
                        color: "#64748b",
                      }}
                    >
                      .xlsx, .xls, or .csv accepted
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Choose File
                  </button>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button
                  onClick={() => setShowBulkDialog(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add SC Inline Form ── */}
      <AnimatePresence>
        {showAddSC && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="add-sc-form-container"
          >
            <form onSubmit={handleAddSubmit} className="sc-form">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  required
                  value={scForm.companyName}
                  onChange={(e) =>
                    setScForm({ ...scForm, companyName: e.target.value })
                  }
                  placeholder="e.g. Acme Constructions"
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  required
                  value={scForm.contactName}
                  onChange={(e) =>
                    setScForm({ ...scForm, contactName: e.target.value })
                  }
                  placeholder="Full Name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={scForm.email}
                  onChange={(e) =>
                    setScForm({ ...scForm, email: e.target.value })
                  }
                  placeholder="name@company.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={scForm.phone}
                  onChange={(e) =>
                    setScForm({ ...scForm, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddSC(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSC}
                  className="btn-primary"
                >
                  {addingSC ? "Adding..." : "Add Sub-Contractor"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sub-Contractor Table ── */}
      <div className="sc-list">
        <div className="sc-header-row">
          <div>Company</div>
          <div>Contact</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {subContractors.length === 0 ? (
          <div className="empty-state">No sub-contractors added yet.</div>
        ) : (
          subContractors.map((sc, index) => (
            <motion.div
              key={sc._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="sc-row"
            >
              <div className="sc-info">
                <div className="sc-name">{sc.companyName}</div>
                <div className="sc-email">{sc.email}</div>
              </div>
              <div className="sc-contact">
                <div>{sc.contactName}</div>
                <div className="sc-phone">{sc.phone}</div>
              </div>
              <div>
                <span
                  className={`badge ${
                    sc.kycStatus === "COMPLETED"
                      ? "badge-green"
                      : sc.kycStatus === "REJECTED"
                        ? "badge-red"
                        : "badge-yellow"
                  }`}
                >
                  {sc.kycStatus?.replace(/_/g, " ") || "Pending"}
                </span>
              </div>
              <div className="sc-actions">
                <button
                  className="btn-icon danger"
                  title="Remove"
                  onClick={() => onDelete(sc._id, sc.companyName)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
