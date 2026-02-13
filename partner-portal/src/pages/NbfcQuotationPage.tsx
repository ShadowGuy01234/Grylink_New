import React, { useState, useEffect } from "react";
import { cwcrfApi, nbfcApi } from "../api";
import toast from "react-hot-toast";

interface AvailableCwcrf {
  _id: string;
  sellerProfile: {
    companyName: string;
    gstin: string;
    constitutionType: string;
  };
  buyerProfile: {
    companyName: string;
    creditRating: string;
  };
  invoiceDetails: {
    invoiceNumber: string;
    invoiceAmount: number;
    invoiceDate: string;
  };
  cwcRequest: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: string;
  };
  buyerVerification: {
    approvedAmount: number;
    repaymentTimeline: string;
    repaymentArrangement: string;
  };
  cwcaf?: {
    riskCategory: "LOW" | "MEDIUM" | "HIGH";
    rmtRecommendation: string;
    riskScore: number;
  };
  sharedAt: string;
  quotationDeadline?: string;
  alreadyQuoted?: boolean;
}

interface QuotationForm {
  offeredAmount: number;
  interestRate: number;
  tenure: number;
  processingFee: number;
  terms: string;
}

const NbfcQuotationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cwcrfs, setCwcrfs] = useState<AvailableCwcrf[]>([]);
  const [selectedCwcrf, setSelectedCwcrf] = useState<AvailableCwcrf | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [showCwcaf, setShowCwcaf] = useState(false);
  const [cwcafData, setCwcafData] = useState<any>(null);
  const [lps, setLps] = useState<any>(null);

  const [quotationForm, setQuotationForm] = useState<QuotationForm>({
    offeredAmount: 0,
    interestRate: 15,
    tenure: 30,
    processingFee: 1,
    terms: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cwcrfRes, lpsRes] = await Promise.all([
        cwcrfApi.getAvailableCwcrfs(),
        nbfcApi.getLps(),
      ]);
      setCwcrfs(cwcrfRes.data.cwcrfs || []);
      setLps(lpsRes.data.lps);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCwcrf = (cwcrf: AvailableCwcrf) => {
    setSelectedCwcrf(cwcrf);
    setShowCwcaf(false);
    setCwcafData(null);

    // Pre-fill quotation form based on LPS and request
    const preferredRate = lps?.interestRatePolicy?.preferredRate || 15;
    const preferredFee = lps?.processingFee?.preferredPercent || 1;

    setQuotationForm({
      offeredAmount: cwcrf.buyerVerification.approvedAmount,
      interestRate: preferredRate,
      tenure:
        parseInt(cwcrf.buyerVerification.repaymentTimeline) ||
        cwcrf.cwcRequest.requestedTenure,
      processingFee: preferredFee,
      terms: "",
    });
  };

  const loadCwcaf = async (cwcrfId: string) => {
    try {
      const res = await cwcrfApi.getCwcaf(cwcrfId);
      setCwcafData(res.data.cwcaf);
      setShowCwcaf(true);
    } catch (err) {
      toast.error("Failed to load CWCAF");
    }
  };

  const handleSubmitQuotation = async () => {
    if (!selectedCwcrf) return;

    // Validation
    if (quotationForm.offeredAmount <= 0) {
      toast.error("Please enter a valid offered amount");
      return;
    }
    if (
      quotationForm.offeredAmount >
      selectedCwcrf.buyerVerification.approvedAmount
    ) {
      toast.error("Offered amount cannot exceed buyer-approved amount");
      return;
    }
    if (quotationForm.interestRate <= 0) {
      toast.error("Please enter a valid interest rate");
      return;
    }

    // LPS validation
    if (lps) {
      if (
        quotationForm.interestRate < lps.interestRatePolicy?.minRate ||
        quotationForm.interestRate > lps.interestRatePolicy?.maxRate
      ) {
        toast.error(
          `Interest rate must be between ${lps.interestRatePolicy.minRate}% and ${lps.interestRatePolicy.maxRate}%`,
        );
        return;
      }
      if (quotationForm.offeredAmount < lps.ticketSize?.minimum) {
        toast.error(
          `Minimum ticket size is ₹${lps.ticketSize.minimum.toLocaleString()}`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await cwcrfApi.submitQuotation(selectedCwcrf._id, quotationForm);
      toast.success("Quotation submitted successfully!");
      setSelectedCwcrf(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[risk] || colors.MEDIUM}`}
      >
        {risk} RISK
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: Record<string, string> = {
      NORMAL: "bg-blue-100 text-blue-800",
      URGENT: "bg-yellow-100 text-yellow-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[urgency] || colors.NORMAL}`}
      >
        {urgency}
      </span>
    );
  };

  const availableCwcrfs = cwcrfs.filter((c) => !c.alreadyQuoted);
  const quotedCwcrfs = cwcrfs.filter((c) => c.alreadyQuoted);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading available CWCRFs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CWCRF Quotations</h1>
          <p className="text-gray-600">
            Review CWC requests and submit your quotations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-blue-600">
              {cwcrfs.length}
            </h3>
            <p className="text-gray-600">Total Available</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-yellow-600">
              {availableCwcrfs.length}
            </h3>
            <p className="text-gray-600">Pending Quotation</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-green-600">
              {quotedCwcrfs.length}
            </h3>
            <p className="text-gray-600">Quoted</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-purple-600">
              {formatCurrency(lps?.monthlyCapacity?.available || 0)}
            </h3>
            <p className="text-gray-600">Available Capacity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CWCRF List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Available CWCRFs</h2>
              </div>
              {availableCwcrfs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No CWCRFs available for quotation</p>
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {availableCwcrfs.map((cwcrf) => (
                    <div
                      key={cwcrf._id}
                      onClick={() => handleSelectCwcrf(cwcrf)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedCwcrf?._id === cwcrf._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm truncate">
                          {cwcrf.sellerProfile?.companyName}
                        </span>
                        {cwcrf.cwcaf?.riskCategory &&
                          getRiskBadge(cwcrf.cwcaf.riskCategory)}
                      </div>
                      <p className="text-xs text-gray-500">
                        Buyer: {cwcrf.buyerProfile?.companyName}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(
                          cwcrf.buyerVerification?.approvedAmount ||
                            cwcrf.cwcRequest.requestedAmount,
                        )}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {cwcrf.cwcRequest.requestedTenure} days
                        </span>
                        {getUrgencyBadge(cwcrf.cwcRequest.urgencyLevel)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quotation Form */}
          <div className="lg:col-span-2">
            {selectedCwcrf ? (
              <div className="space-y-6">
                {/* CWCRF Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">CWCRF Details</h2>
                    <button
                      onClick={() => loadCwcaf(selectedCwcrf._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showCwcaf ? "Hide CWCAF" : "View CWCAF"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Seller
                      </h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">
                          {selectedCwcrf.sellerProfile?.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          GSTIN: {selectedCwcrf.sellerProfile?.gstin}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {selectedCwcrf.sellerProfile?.constitutionType}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Buyer
                      </h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">
                          {selectedCwcrf.buyerProfile?.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Rating:{" "}
                          {selectedCwcrf.buyerProfile?.creditRating ||
                            "Not Rated"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Invoice Amount</p>
                      <p className="font-semibold">
                        {formatCurrency(
                          selectedCwcrf.invoiceDetails.invoiceAmount,
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Approved Amount</p>
                      <p className="font-semibold">
                        {formatCurrency(
                          selectedCwcrf.buyerVerification.approvedAmount,
                        )}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-gray-500">
                        Repayment Timeline
                      </p>
                      <p className="font-semibold">
                        {selectedCwcrf.buyerVerification.repaymentTimeline} days
                      </p>
                    </div>
                  </div>

                  {/* CWCAF Panel */}
                  {showCwcaf && cwcafData && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        CWCAF Summary
                      </h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">
                              Risk Category
                            </p>
                            {getRiskBadge(cwcafData.riskCategory)}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Risk Score</p>
                            <p className="font-semibold">
                              {cwcafData.riskScore}/100
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reviewed By</p>
                            <p className="font-semibold">RMT</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            RMT Recommendation
                          </p>
                          <p className="text-sm">
                            {cwcafData.rmtRecommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quotation Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Submit Quotation
                  </h2>

                  {/* LPS Guidelines */}
                  {lps && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Your LPS Guidelines:
                      </p>
                      <p className="text-xs text-blue-700">
                        Interest: {lps.interestRatePolicy?.minRate}% -{" "}
                        {lps.interestRatePolicy?.maxRate}% | Ticket:{" "}
                        {formatCurrency(lps.ticketSize?.minimum || 0)} -{" "}
                        {formatCurrency(lps.ticketSize?.maximum || 0)} | Tenure:{" "}
                        {lps.tenurePreference?.minDays} -{" "}
                        {lps.tenurePreference?.maxDays} days
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Offered Amount (₹) *
                      </label>
                      <input
                        type="number"
                        value={quotationForm.offeredAmount}
                        onChange={(e) =>
                          setQuotationForm((prev) => ({
                            ...prev,
                            offeredAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        max={selectedCwcrf.buyerVerification.approvedAmount}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max:{" "}
                        {formatCurrency(
                          selectedCwcrf.buyerVerification.approvedAmount,
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (% p.a.) *
                      </label>
                      <input
                        type="number"
                        value={quotationForm.interestRate}
                        onChange={(e) =>
                          setQuotationForm((prev) => ({
                            ...prev,
                            interestRate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        step="0.5"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tenure (Days) *
                      </label>
                      <input
                        type="number"
                        value={quotationForm.tenure}
                        onChange={(e) =>
                          setQuotationForm((prev) => ({
                            ...prev,
                            tenure: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Fee (%)
                      </label>
                      <input
                        type="number"
                        value={quotationForm.processingFee}
                        onChange={(e) =>
                          setQuotationForm((prev) => ({
                            ...prev,
                            processingFee: parseFloat(e.target.value) || 0,
                          }))
                        }
                        step="0.1"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Terms & Conditions
                    </label>
                    <textarea
                      value={quotationForm.terms}
                      onChange={(e) =>
                        setQuotationForm((prev) => ({
                          ...prev,
                          terms: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter any specific terms or conditions..."
                    />
                  </div>

                  {/* Quotation Summary */}
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h4 className="text-sm font-semibold mb-2">
                      Quotation Summary
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Principal</p>
                        <p className="font-semibold">
                          {formatCurrency(quotationForm.offeredAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Interest</p>
                        <p className="font-semibold">
                          {formatCurrency(
                            (quotationForm.offeredAmount *
                              quotationForm.interestRate *
                              quotationForm.tenure) /
                              (365 * 100),
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Processing Fee</p>
                        <p className="font-semibold">
                          {formatCurrency(
                            (quotationForm.offeredAmount *
                              quotationForm.processingFee) /
                              100,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Repayment</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(
                            quotationForm.offeredAmount +
                              (quotationForm.offeredAmount *
                                quotationForm.interestRate *
                                quotationForm.tenure) /
                                (365 * 100),
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitQuotation}
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {submitting ? "Submitting..." : "Submit Quotation"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Select a CWCRF
                </h3>
                <p className="text-gray-500">
                  Click on a CWCRF from the list to review details and submit
                  your quotation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NbfcQuotationPage;
