import { useState, useEffect } from 'react';
import { subContractorApi } from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Table from '../components/Table';
import StatCard from '../components/StatCard';
import FileUpload from '../components/FileUpload';

const SubContractorDashboardNew = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    ownerName: '',
    address: '',
    phone: '',
    vendorId: '',
    gstin: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Bill upload
  const [showBillModal, setShowBillModal] = useState(false);
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [billData, setBillData] = useState({ billNumber: '', amount: '', description: '' });
  const [uploadingBill, setUploadingBill] = useState(false);

  // CWC submission
  const [showCwcModal, setShowCwcModal] = useState(false);
  const [cwcForm, setCwcForm] = useState({ billId: '', paymentReference: '' });
  const [submittingCwc, setSubmittingCwc] = useState(false);

  // Bid response
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showBidModal, setShowBidModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await subContractorApi.getDashboard();
      setDashboard(res.data);
      
      if (res.data.subContractor) {
        const sc = res.data.subContractor;
        setProfileForm({
          companyName: sc.companyName || '',
          ownerName: sc.ownerName || '',
          address: sc.address || '',
          phone: sc.phone || '',
          vendorId: sc.vendorId || '',
          gstin: sc.gstin || '',
        });
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    if (!profileForm.companyName || !profileForm.ownerName) {
      toast.error('Company name and owner name are required');
      return;
    }

    setSavingProfile(true);
    try {
      await subContractorApi.updateProfile(profileForm);
      toast.success('Profile updated successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadBill = async () => {
    if (billFiles.length === 0) {
      toast.error('Please select bill files');
      return;
    }

    setUploadingBill(true);
    try {
      const formData = new FormData();
      billFiles.forEach((f) => formData.append('bills', f));
      formData.append('billNumber', billData.billNumber);
      formData.append('amount', billData.amount);
      formData.append('description', billData.description);
      
      await subContractorApi.uploadBills(formData);
      toast.success('Bills uploaded successfully!');
      setShowBillModal(false);
      setBillFiles([]);
      setBillData({ billNumber: '', amount: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingBill(false);
    }
  };

  const handleSubmitCwc = async () => {
    if (!cwcForm.billId || !cwcForm.paymentReference) {
      toast.error('Please select a bill and enter payment reference');
      return;
    }

    setSubmittingCwc(true);
    try {
      await subContractorApi.submitCwc({
        billId: cwcForm.billId,
        paymentReference: cwcForm.paymentReference,
      });
      toast.success('CWC RF submitted successfully!');
      setShowCwcModal(false);
      setCwcForm({ billId: '', paymentReference: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmittingCwc(false);
    }
  };

  const handleBidResponse = async (bidId: string, decision: 'accept' | 'reject') => {
    try {
      await subContractorApi.respondToBid(bidId, { decision });
      toast.success(`Bid ${decision}ed successfully!`);
      setShowBidModal(false);
      setSelectedBid(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Response failed');
    }
  };

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  const sc = dashboard?.subContractor;
  const bills = dashboard?.bills || [];
  const cwcRequests = dashboard?.cwcRequests || [];
  const bids = dashboard?.bids || [];
  const verifiedBills = bills.filter((b: any) => b.status === 'VERIFIED');
  const pendingBids = bids.filter((b: any) => b.status === 'SUBMITTED');

  // Bill columns
  const billColumns = [
    { key: 'billNumber', header: 'Bill #', render: (row: any) => row.billNumber || '—' },
    { key: 'amount', header: 'Amount', render: (row: any) => row.amount ? `₹${row.amount.toLocaleString()}` : '—' },
    { key: 'description', header: 'Description', render: (row: any) => row.description || '—' },
    { key: 'status', header: 'Status', render: (row: any) => <Badge status={row.status} /> },
    { 
      key: 'uploadedAt', 
      header: 'Uploaded', 
      render: (row: any) => new Date(row.createdAt).toLocaleDateString() 
    },
  ];

  // Bid columns
  const bidColumns = [
    { 
      key: 'case', 
      header: 'Case #', 
      render: (row: any) => row.caseId?.caseNumber || '—' 
    },
    { 
      key: 'company', 
      header: 'Company', 
      render: (row: any) => row.epcId?.companyName || '—' 
    },
    { 
      key: 'bidAmount', 
      header: 'Bid Amount', 
      render: (row: any) => `₹${row.bidAmount.toLocaleString()}` 
    },
    { 
      key: 'duration', 
      header: 'Duration', 
      render: (row: any) => `${row.fundingDurationDays} days` 
    },
    { key: 'status', header: 'Status', render: (row: any) => <Badge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: any) => (
        row.status === 'SUBMITTED' ? (
          <Button 
            size="sm" 
            variant="primary" 
            onClick={() => {
              setSelectedBid(row);
              setShowBidModal(true);
            }}
          >
            Review
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{sc?.companyName || 'Sub-Contractor Dashboard'}</h1>
          <p className="subtitle">
            {sc && <Badge status={sc.status} />}
          </p>
        </div>
        <div className="header-actions">
          <Button icon={<HiOutlineDocumentText />} onClick={() => setShowBillModal(true)}>
            Upload Bill
          </Button>
          {verifiedBills.length > 0 && (
            <Button icon={<HiOutlineCurrencyRupee />} variant="success" onClick={() => setShowCwcModal(true)}>
              Submit CWC
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Bills"
          value={bills.length}
          icon={<HiOutlineDocumentText />}
          variant="info"
        />
        <StatCard
          title="Verified Bills"
          value={verifiedBills.length}
          icon={<HiOutlineCheckCircle />}
          variant="success"
        />
        <StatCard
          title="Pending Bids"
          value={pendingBids.length}
          icon={<HiOutlineClipboardList />}
          variant="warning"
        />
        <StatCard
          title="CWC Requests"
          value={cwcRequests.length}
          icon={<HiOutlineCurrencyRupee />}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
        >
          <HiOutlineClipboardList /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`} 
          onClick={() => setActiveTab('profile')}
        >
          <HiOutlineUser /> Profile
        </button>
        <button 
          className={`tab ${activeTab === 'bills' ? 'active' : ''}`} 
          onClick={() => setActiveTab('bills')}
        >
          <HiOutlineDocumentText /> Bills
        </button>
        <button 
          className={`tab ${activeTab === 'bids' ? 'active' : ''}`} 
          onClick={() => setActiveTab('bids')}
        >
          <HiOutlineCurrencyRupee /> Bids & CWC
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {sc?.status !== 'PROFILE_COMPLETED' && (
            <Card className="mb-6" title="⚠️ Action Required">
              <p className="mb-4">Please complete your profile to start uploading bills.</p>
              <Button onClick={() => setActiveTab('profile')}>
                Complete Profile
              </Button>
            </Card>
          )}

          {pendingBids.length > 0 && (
            <Card title="Pending Bid Reviews" className="mb-6">
              <Table columns={bidColumns} data={pendingBids} />
            </Card>
          )}

          {verifiedBills.length > 0 && (
            <Card title="Verified Bills (Ready for CWC)" className="mb-6">
              <Table columns={billColumns} data={verifiedBills} />
            </Card>
          )}

          {sc?.status === 'PROFILE_COMPLETED' && pendingBids.length === 0 && verifiedBills.length === 0 && (
            <Card>
              <div className="empty-state">
                <HiOutlineClipboardList style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }} />
                <p>No pending actions at the moment</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Complete Your Profile">
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                value={profileForm.companyName}
                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="form-group">
              <label>Owner Name *</label>
              <input
                value={profileForm.ownerName}
                onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                placeholder="Enter owner name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+91 1234567890"
                required
              />
            </div>
            <div className="form-group">
              <label>Vendor ID</label>
              <input
                value={profileForm.vendorId}
                onChange={(e) => setProfileForm({ ...profileForm, vendorId: e.target.value })}
                placeholder="Enter vendor ID"
              />
            </div>
            <div className="form-group">
              <label>GSTIN</label>
              <input
                value={profileForm.gstin}
                onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                placeholder="Enter GSTIN"
              />
            </div>
            <div className="form-group full-span">
              <label>Address *</label>
              <textarea
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Enter complete address"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveProfile} loading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <Card title="All Bills">
          <Table 
            columns={billColumns} 
            data={bills}
            emptyMessage="No bills uploaded yet"
          />
        </Card>
      )}

      {/* Bids & CWC Tab */}
      {activeTab === 'bids' && (
        <div>
          <Card title="All Bids" className="mb-6">
            <Table 
              columns={bidColumns} 
              data={bids}
              emptyMessage="No bids received yet"
            />
          </Card>

          {cwcRequests.length > 0 && (
            <Card title="CWC Requests">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Bill #</th>
                      <th>Payment Ref</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cwcRequests.map((cwc: any) => (
                      <tr key={cwc._id}>
                        <td>{cwc.billId?.billNumber || '—'}</td>
                        <td>{cwc.paymentReference}</td>
                        <td><Badge status={cwc.status} /></td>
                        <td>{new Date(cwc.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Upload Bill Modal */}
      <Modal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        title="Upload Bill"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBillModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadBill} loading={uploadingBill}>
              Upload Bill
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Bill Number</label>
          <input
            value={billData.billNumber}
            onChange={(e) => setBillData({ ...billData, billNumber: e.target.value })}
            placeholder="Enter bill number"
          />
        </div>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            value={billData.amount}
            onChange={(e) => setBillData({ ...billData, amount: e.target.value })}
            placeholder="Enter bill amount"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={billData.description}
            onChange={(e) => setBillData({ ...billData, description: e.target.value })}
            placeholder="Enter bill description"
          />
        </div>
        <FileUpload
          onFilesChange={setBillFiles}
          accept=".pdf,.jpg,.jpeg,.png"
          label="Drop bill files here or click to browse"
        />
      </Modal>

      {/* Submit CWC Modal */}
      <Modal
        isOpen={showCwcModal}
        onClose={() => setShowCwcModal(false)}
        title="Submit CWC Request"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCwcModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCwc} loading={submittingCwc}>
              Submit CWC
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label>Select Bill *</label>
          <select
            value={cwcForm.billId}
            onChange={(e) => setCwcForm({ ...cwcForm, billId: e.target.value })}
            required
          >
            <option value="">Select a verified bill...</option>
            {verifiedBills.map((bill: any) => (
              <option key={bill._id} value={bill._id}>
                {bill.billNumber} - ₹{bill.amount?.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Payment Reference *</label>
          <input
            value={cwcForm.paymentReference}
            onChange={(e) => setCwcForm({ ...cwcForm, paymentReference: e.target.value })}
            placeholder="Enter payment reference number"
            required
          />
        </div>
      </Modal>

      {/* Bid Review Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Review Bid"
        footer={
          <>
            <Button 
              variant="danger" 
              onClick={() => selectedBid && handleBidResponse(selectedBid._id, 'reject')}
            >
              Reject
            </Button>
            <Button 
              variant="success" 
              onClick={() => selectedBid && handleBidResponse(selectedBid._id, 'accept')}
            >
              Accept
            </Button>
          </>
        }
      >
        {selectedBid && (
          <div>
            <div className="mb-4">
              <p><strong>Company:</strong> {selectedBid.epcId?.companyName}</p>
              <p><strong>Case:</strong> {selectedBid.caseId?.caseNumber}</p>
              <p><strong>Bid Amount:</strong> ₹{selectedBid.bidAmount.toLocaleString()}</p>
              <p><strong>Funding Duration:</strong> {selectedBid.fundingDurationDays} days</p>
              <p><Badge status={selectedBid.status} /></p>
            </div>
            <div className="section-note">
              Review the bid details carefully before accepting or rejecting.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubContractorDashboardNew;
