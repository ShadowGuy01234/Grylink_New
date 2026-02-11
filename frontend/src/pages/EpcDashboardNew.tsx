import React, { useState, useEffect } from 'react';
import { companyApi, casesApi, bidsApi } from '../api';
import toast from 'react-hot-toast';
import { 
  HiOutlineUpload, 
  HiOutlineUserAdd, 
  HiOutlineClipboardCheck, 
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Table from '../components/Table';
import StatCard from '../components/StatCard';
import FileUpload from '../components/FileUpload';

const DOCUMENT_TYPES = [
  { value: 'CIN', label: 'CIN Certificate' },
  { value: 'GST', label: 'GST Registration' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'BOARD_RESOLUTION', label: 'Board Resolution' },
  { value: 'BANK_STATEMENTS', label: 'Bank Statements (12 months)' },
  { value: 'AUDITED_FINANCIALS', label: 'Audited Financials (2 years)' },
  { value: 'PROJECT_DETAILS', label: 'Project Details' },
  { value: 'CASHFLOW_DETAILS', label: 'Cashflow Details' },
];

const EpcDashboardNew = () => {
  const [profile, setProfile] = useState<any>(null);
  const [subContractors, setSubContractors] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [showSCModal, setShowSCModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  // Forms
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);

  const [scForm, setScForm] = useState({ 
    companyName: '', 
    contactName: '', 
    email: '', 
    phone: '' 
  });
  const [addingSC, setAddingSC] = useState(false);

  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [bidForm, setBidForm] = useState({ bidAmount: '', fundingDurationDays: '' });
  const [placingBid, setPlacingBid] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, scRes, casesRes] = await Promise.all([
        companyApi.getProfile(),
        companyApi.getSubContractors(),
        casesApi.getCases(),
      ]);
      
      setProfile(profileRes.data);
      setSubContractors(scRes.data);
      setCases(casesRes.data);
      
      // Extract documents from profile
      if (profileRes.data?.documents) {
        setDocuments(profileRes.data.documents);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadDocument = async () => {
    if (docFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    if (!selectedDocType) {
      toast.error('Please select document type');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      docFiles.forEach((f) => formData.append('documents', f));
      formData.append('documentTypes', JSON.stringify([selectedDocType]));
      
      await companyApi.uploadDocuments(formData);
      toast.success('Documents uploaded successfully!');
      setShowDocModal(false);
      setDocFiles([]);
      setSelectedDocType('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubContractor = async () => {
    if (!scForm.companyName || !scForm.email) {
      toast.error('Company name and email are required');
      return;
    }

    setAddingSC(true);
    try {
      await companyApi.addSubContractors([scForm]);
      toast.success('Sub-contractor added successfully!');
      setShowSCModal(false);
      setScForm({ companyName: '', contactName: '', email: '', phone: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add sub-contractor');
    } finally {
      setAddingSC(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await companyApi.bulkAddSubContractors(formData);
      toast.success(`Added ${res.data.created?.length || 0} sub-contractors`);
      if (res.data.errors?.length) {
        toast.error(`${res.data.errors.length} rows had errors`);
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Bulk upload failed');
    }
    e.target.value = '';
  };

  const handleReviewCase = async (caseId: string, decision: 'approve' | 'reject', notes?: string) => {
    try {
      await casesApi.reviewCase(caseId, { decision, notes });
      toast.success(`Case ${decision === 'approve' ? 'approved' : 'rejected'}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Review failed');
    }
  };

  const openBidModal = (caseItem: any) => {
    setSelectedCase(caseItem);
    setShowBidModal(true);
    setBidForm({ bidAmount: '', fundingDurationDays: '' });
  };

  const handlePlaceBid = async () => {
    if (!bidForm.bidAmount || !bidForm.fundingDurationDays) {
      toast.error('Please fill in all bid details');
      return;
    }

    setPlacingBid(true);
    try {
      await bidsApi.placeBid({
        caseId: selectedCase._id,
        bidAmount: Number(bidForm.bidAmount),
        fundingDurationDays: Number(bidForm.fundingDurationDays),
      });
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
      setSelectedCase(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  const company = profile?.company;
  const pendingCases = cases.filter(c => c.status === 'READY_FOR_COMPANY_REVIEW');
  const activeCases = cases.filter(c => ['EPC_VERIFIED', 'BID_PLACED', 'NEGOTIATION_IN_PROGRESS'].includes(c.status));

  // Sub-contractor columns
  const scColumns = [
    { key: 'companyName', header: 'Company', render: (row: any) => row.companyName || '—' },
    { key: 'contactName', header: 'Contact', render: (row: any) => row.contactName || '—' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (row: any) => row.phone || '—' },
    { key: 'status', header: 'Status', render: (row: any) => <Badge status={row.status} /> },
  ];

  // Case columns
  const caseColumns = [
    { key: 'caseNumber', header: 'Case #', render: (row: any) => row.caseNumber || '—' },
    { 
      key: 'subContractor', 
      header: 'Sub-Contractor', 
      render: (row: any) => row.subContractorId?.companyName || '—' 
    },
    { 
      key: 'bill', 
      header: 'Amount', 
      render: (row: any) => row.billId?.amount ? `₹${row.billId.amount.toLocaleString()}` : '—' 
    },
    { key: 'status', header: 'Status', render: (row: any) => <Badge status={row.status} /> },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (row: any) => (
        <div className="action-buttons">
          {row.status === 'READY_FOR_COMPANY_REVIEW' && (
            <>
              <Button size="sm" variant="success" onClick={() => handleReviewCase(row._id, 'approve')}>
                Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleReviewCase(row._id, 'reject')}>
                Reject
              </Button>
            </>
          )}
          {row.status === 'EPC_VERIFIED' && (
            <Button size="sm" variant="primary" onClick={() => openBidModal(row)}>
              Place Bid
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{company?.companyName}</h1>
          <p className="subtitle">
            EPC Dashboard <Badge status={company?.status} />
          </p>
        </div>
        <div className="header-actions">
          <Button icon={<HiOutlineUpload />} onClick={() => setShowDocModal(true)}>
            Upload Document
          </Button>
          <Button icon={<HiOutlineUserAdd />} variant="success" onClick={() => setShowSCModal(true)}>
            Add Sub-Contractor
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Sub-Contractors"
          value={subContractors.length}
          icon={<HiOutlineUserAdd />}
          variant="info"
        />
        <StatCard
          title="Documents Uploaded"
          value={documents.length}
          icon={<HiOutlineDocumentText />}
          variant="default"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingCases.length}
          icon={<HiOutlineClipboardCheck />}
          variant="warning"
        />
        <StatCard
          title="Active Cases"
          value={activeCases.length}
          icon={<HiOutlineCheckCircle />}
          variant="success"
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
        >
          <HiOutlineClipboardCheck /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`} 
          onClick={() => setActiveTab('documents')}
        >
          <HiOutlineDocumentText /> Documents
        </button>
        <button 
          className={`tab ${activeTab === 'subcontractors' ? 'active' : ''}`} 
          onClick={() => setActiveTab('subcontractors')}
        >
          <HiOutlineUserAdd /> Sub-Contractors
        </button>
        <button 
          className={`tab ${activeTab === 'cases' ? 'active' : ''}`} 
          onClick={() => setActiveTab('cases')}
        >
          <HiOutlineCurrencyRupee /> Cases & Bids
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {pendingCases.length > 0 && (
            <Card title="Pending Case Reviews" className="mb-6">
              <Table columns={caseColumns} data={pendingCases} />
            </Card>
          )}

          {activeCases.length > 0 && (
            <Card title="Active Cases" className="mb-6">
              <Table columns={caseColumns} data={activeCases} />
            </Card>
          )}

          {pendingCases.length === 0 && activeCases.length === 0 && (
            <Card>
              <div className="empty-state">
                <HiOutlineClipboardCheck style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }} />
                <p>No active cases at the moment</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card title="Company Documents">
          {documents.length > 0 ? (
            <div className="doc-grid">
              {documents.map((doc: any, idx: number) => (
                <div key={idx} className="doc-card">
                  <div className="doc-type">{doc.documentType}</div>
                  <div className="doc-name">{doc.fileName}</div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                    View Document →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <HiOutlineDocumentText style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }} />
              <p>No documents uploaded yet</p>
              <Button onClick={() => setShowDocModal(true)} className="mt-4">
                Upload Your First Document
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Sub-Contractors Tab */}
      {activeTab === 'subcontractors' && (
        <Card 
          title="Sub-Contractors" 
          actions={
            <>
              <input 
                id="bulk-upload" 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleBulkUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="bulk-upload">
                <Button variant="secondary" size="sm">
                  Bulk Upload (Excel)
                </Button>
              </label>
            </>
          }
        >
          <Table 
            columns={scColumns} 
            data={subContractors}
            emptyMessage="No sub-contractors added yet"
          />
        </Card>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <Card title="All Cases">
          <Table 
            columns={caseColumns} 
            data={cases}
            emptyMessage="No cases available"
          />
        </Card>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Upload Document"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDocModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} loading={uploading}>
              Upload
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Document Type *</label>
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            required
          >
            <option value="">Select document type...</option>
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>
        <FileUpload
          onFilesChange={setDocFiles}
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={false}
          label="Drop document here or click to browse"
        />
      </Modal>

      {/* Add Sub-Contractor Modal */}
      <Modal
        isOpen={showSCModal}
        onClose={() => setShowSCModal(false)}
        title="Add Sub-Contractor"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSCModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubContractor} loading={addingSC}>
              Add Sub-Contractor
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Company Name *</label>
          <input
            value={scForm.companyName}
            onChange={(e) => setScForm({ ...scForm, companyName: e.target.value })}
            placeholder="Enter company name"
            required
          />
        </div>
        <div className="form-group">
          <label>Contact Name</label>
          <input
            value={scForm.contactName}
            onChange={(e) => setScForm({ ...scForm, contactName: e.target.value })}
            placeholder="Enter contact name"
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={scForm.email}
            onChange={(e) => setScForm({ ...scForm, email: e.target.value })}
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            value={scForm.phone}
            onChange={(e) => setScForm({ ...scForm, phone: e.target.value })}
            placeholder="+91 1234567890"
          />
        </div>
      </Modal>

      {/* Place Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title={`Place Bid - ${selectedCase?.caseNumber}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBidModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBid} loading={placingBid}>
              Place Bid
            </Button>
          </>
        }
      >
        {selectedCase && (
          <>
            <div className="mb-4">
              <p><strong>Bill Amount:</strong> ₹{selectedCase.billId?.amount?.toLocaleString()}</p>
              <p><strong>Sub-Contractor:</strong> {selectedCase.subContractorId?.companyName}</p>
            </div>
            
            <div className="form-group">
              <label>Bid Amount (₹) *</label>
              <input
                type="number"
                value={bidForm.bidAmount}
                onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                placeholder="Enter bid amount"
                required
              />
            </div>
            <div className="form-group">
              <label>Funding Duration (Days) *</label>
              <input
                type="number"
                value={bidForm.fundingDurationDays}
                onChange={(e) => setBidForm({ ...bidForm, fundingDurationDays: e.target.value })}
                placeholder="Enter funding duration"
                required
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EpcDashboardNew;
