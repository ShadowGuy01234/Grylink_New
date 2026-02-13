import React, { useState, useEffect } from "react";
import { nbfcApi } from "../api";
import toast from "react-hot-toast";

interface LendingPreferenceSheet {
  interestRatePolicy: {
    minRate: number;
    maxRate: number;
    preferredRate: number;
    rateType: "FIXED" | "FLOATING" | "BOTH";
  };
  riskAppetite: {
    acceptedCategories: ("LOW" | "MEDIUM" | "HIGH")[];
    maxExposurePerSeller: number;
    maxExposurePerBuyer: number;
    preferredSectors: string[];
    excludedSectors: string[];
  };
  ticketSize: {
    minimum: number;
    maximum: number;
    preferredRange: { min: number; max: number };
  };
  monthlyCapacity: {
    totalLimit: number;
    utilized: number;
    available: number;
    autoRefresh: boolean;
    refreshDay: number;
  };
  tenurePreference: {
    minDays: number;
    maxDays: number;
    preferredDays: number;
  };
  sectorPreferences: {
    sector: string;
    weightage: number;
    enabled: boolean;
  }[];
  processingFee: {
    minPercent: number;
    maxPercent: number;
    preferredPercent: number;
  };
}

const defaultLps: LendingPreferenceSheet = {
  interestRatePolicy: {
    minRate: 12,
    maxRate: 24,
    preferredRate: 18,
    rateType: "FIXED",
  },
  riskAppetite: {
    acceptedCategories: ["LOW", "MEDIUM"],
    maxExposurePerSeller: 5000000,
    maxExposurePerBuyer: 10000000,
    preferredSectors: [],
    excludedSectors: [],
  },
  ticketSize: {
    minimum: 100000,
    maximum: 10000000,
    preferredRange: { min: 500000, max: 5000000 },
  },
  monthlyCapacity: {
    totalLimit: 50000000,
    utilized: 0,
    available: 50000000,
    autoRefresh: true,
    refreshDay: 1,
  },
  tenurePreference: {
    minDays: 15,
    maxDays: 180,
    preferredDays: 45,
  },
  sectorPreferences: [
    { sector: "Infrastructure", weightage: 80, enabled: true },
    { sector: "Energy", weightage: 70, enabled: true },
    { sector: "Real Estate", weightage: 60, enabled: true },
    { sector: "Manufacturing", weightage: 50, enabled: true },
    { sector: "Services", weightage: 40, enabled: true },
  ],
  processingFee: {
    minPercent: 0.5,
    maxPercent: 2,
    preferredPercent: 1,
  },
};

const SECTORS = [
  "Infrastructure",
  "Energy",
  "Real Estate",
  "Manufacturing",
  "Services",
  "Construction",
  "IT & Technology",
  "Healthcare",
  "Retail",
  "Agriculture",
];

const LpsManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lps, setLps] = useState<LendingPreferenceSheet>(defaultLps);
  const [activeSection, setActiveSection] = useState("interest");

  useEffect(() => {
    loadLps();
  }, []);

  const loadLps = async () => {
    try {
      const res = await nbfcApi.getLps();
      if (res.data.lps) {
        setLps({ ...defaultLps, ...res.data.lps });
      }
    } catch (err) {
      console.log("No existing LPS, using defaults");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await nbfcApi.updateLps(lps);
      toast.success("Lending preferences saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateLps = (
    section: keyof LendingPreferenceSheet,
    field: string,
    value: any,
  ) => {
    setLps((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  const toggleRiskCategory = (category: "LOW" | "MEDIUM" | "HIGH") => {
    const current = lps.riskAppetite.acceptedCategories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    updateLps("riskAppetite", "acceptedCategories", updated);
  };

  const updateSectorPreference = (
    sector: string,
    field: "weightage" | "enabled",
    value: any,
  ) => {
    const updated = lps.sectorPreferences.map((s) =>
      s.sector === sector ? { ...s, [field]: value } : s,
    );
    setLps((prev) => ({ ...prev, sectorPreferences: updated }));
  };

  const addSector = (sector: string) => {
    if (!lps.sectorPreferences.find((s) => s.sector === sector)) {
      setLps((prev) => ({
        ...prev,
        sectorPreferences: [
          ...prev.sectorPreferences,
          { sector, weightage: 50, enabled: true },
        ],
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const capacityPercentage = () => {
    const total = lps.monthlyCapacity.totalLimit;
    const utilized = lps.monthlyCapacity.utilized;
    return total > 0 ? Math.round((utilized / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading Lending Preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lending Preference Sheet (LPS)
            </h1>
            <p className="text-gray-600">
              Configure your lending parameters and risk appetite
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {/* Monthly Capacity Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Monthly Capacity Overview
          </h2>
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Limit</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(lps.monthlyCapacity.totalLimit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilized</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(lps.monthlyCapacity.utilized)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(lps.monthlyCapacity.available)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${capacityPercentage()}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {capacityPercentage()}% utilized
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["interest", "risk", "ticket", "tenure", "sectors", "fees"].map(
            (section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  activeSection === section
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {section === "interest"
                  ? "Interest Rate"
                  : section === "risk"
                    ? "Risk Appetite"
                    : section === "ticket"
                      ? "Ticket Size"
                      : section === "tenure"
                        ? "Tenure"
                        : section === "sectors"
                          ? "Sector Preferences"
                          : "Processing Fee"}
              </button>
            ),
          )}
        </div>

        {/* Interest Rate Section */}
        {activeSection === "interest" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Interest Rate Policy</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rate (% p.a.)
                </label>
                <input
                  type="number"
                  value={lps.interestRatePolicy.minRate}
                  onChange={(e) =>
                    updateLps(
                      "interestRatePolicy",
                      "minRate",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.5"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Rate (% p.a.)
                </label>
                <input
                  type="number"
                  value={lps.interestRatePolicy.maxRate}
                  onChange={(e) =>
                    updateLps(
                      "interestRatePolicy",
                      "maxRate",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.5"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Rate (% p.a.)
                </label>
                <input
                  type="number"
                  value={lps.interestRatePolicy.preferredRate}
                  onChange={(e) =>
                    updateLps(
                      "interestRatePolicy",
                      "preferredRate",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.5"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Type
                </label>
                <select
                  value={lps.interestRatePolicy.rateType}
                  onChange={(e) =>
                    updateLps("interestRatePolicy", "rateType", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="FIXED">Fixed</option>
                  <option value="FLOATING">Floating</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Risk Appetite Section */}
        {activeSection === "risk" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Appetite</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accepted Risk Categories
              </label>
              <div className="flex gap-4">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((category) => (
                  <label
                    key={category}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${
                      lps.riskAppetite.acceptedCategories.includes(category)
                        ? category === "LOW"
                          ? "bg-green-100 border-green-500"
                          : category === "MEDIUM"
                            ? "bg-yellow-100 border-yellow-500"
                            : "bg-red-100 border-red-500"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={lps.riskAppetite.acceptedCategories.includes(
                        category,
                      )}
                      onChange={() => toggleRiskCategory(category)}
                      className="hidden"
                    />
                    <span className="font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Exposure Per Seller (₹)
                </label>
                <input
                  type="number"
                  value={lps.riskAppetite.maxExposurePerSeller}
                  onChange={(e) =>
                    updateLps(
                      "riskAppetite",
                      "maxExposurePerSeller",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Exposure Per Buyer (₹)
                </label>
                <input
                  type="number"
                  value={lps.riskAppetite.maxExposurePerBuyer}
                  onChange={(e) =>
                    updateLps(
                      "riskAppetite",
                      "maxExposurePerBuyer",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ticket Size Section */}
        {activeSection === "ticket" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ticket Size</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Ticket Size (₹)
                </label>
                <input
                  type="number"
                  value={lps.ticketSize.minimum}
                  onChange={(e) =>
                    updateLps(
                      "ticketSize",
                      "minimum",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Ticket Size (₹)
                </label>
                <input
                  type="number"
                  value={lps.ticketSize.maximum}
                  onChange={(e) =>
                    updateLps(
                      "ticketSize",
                      "maximum",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Range Min (₹)
                </label>
                <input
                  type="number"
                  value={lps.ticketSize.preferredRange.min}
                  onChange={(e) => {
                    setLps((prev) => ({
                      ...prev,
                      ticketSize: {
                        ...prev.ticketSize,
                        preferredRange: {
                          ...prev.ticketSize.preferredRange,
                          min: parseFloat(e.target.value),
                        },
                      },
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Range Max (₹)
                </label>
                <input
                  type="number"
                  value={lps.ticketSize.preferredRange.max}
                  onChange={(e) => {
                    setLps((prev) => ({
                      ...prev,
                      ticketSize: {
                        ...prev.ticketSize,
                        preferredRange: {
                          ...prev.ticketSize.preferredRange,
                          max: parseFloat(e.target.value),
                        },
                      },
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tenure Section */}
        {activeSection === "tenure" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tenure Preference</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Days
                </label>
                <input
                  type="number"
                  value={lps.tenurePreference.minDays}
                  onChange={(e) =>
                    updateLps(
                      "tenurePreference",
                      "minDays",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Days
                </label>
                <input
                  type="number"
                  value={lps.tenurePreference.maxDays}
                  onChange={(e) =>
                    updateLps(
                      "tenurePreference",
                      "maxDays",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Days
                </label>
                <input
                  type="number"
                  value={lps.tenurePreference.preferredDays}
                  onChange={(e) =>
                    updateLps(
                      "tenurePreference",
                      "preferredDays",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sector Preferences Section */}
        {activeSection === "sectors" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sector Preferences</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Sector
              </label>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSector(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a sector to add...</option>
                  {SECTORS.filter(
                    (s) => !lps.sectorPreferences.find((sp) => sp.sector === s),
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {lps.sectorPreferences.map((sp) => (
                <div
                  key={sp.sector}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sp.enabled}
                      onChange={(e) =>
                        updateSectorPreference(
                          sp.sector,
                          "enabled",
                          e.target.checked,
                        )
                      }
                      className="rounded"
                    />
                    <span className="font-medium w-32">{sp.sector}</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="range"
                      value={sp.weightage}
                      onChange={(e) =>
                        updateSectorPreference(
                          sp.sector,
                          "weightage",
                          parseInt(e.target.value),
                        )
                      }
                      min="0"
                      max="100"
                      className="w-full"
                      disabled={!sp.enabled}
                    />
                  </div>
                  <span
                    className={`w-12 text-right ${sp.enabled ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {sp.weightage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Fee Section */}
        {activeSection === "fees" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Processing Fee</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum (%)
                </label>
                <input
                  type="number"
                  value={lps.processingFee.minPercent}
                  onChange={(e) =>
                    updateLps(
                      "processingFee",
                      "minPercent",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum (%)
                </label>
                <input
                  type="number"
                  value={lps.processingFee.maxPercent}
                  onChange={(e) =>
                    updateLps(
                      "processingFee",
                      "maxPercent",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred (%)
                </label>
                <input
                  type="number"
                  value={lps.processingFee.preferredPercent}
                  onChange={(e) =>
                    updateLps(
                      "processingFee",
                      "preferredPercent",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Monthly Capacity Settings */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Monthly Capacity Settings
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Monthly Limit (₹)
              </label>
              <input
                type="number"
                value={lps.monthlyCapacity.totalLimit}
                onChange={(e) => {
                  const total = parseFloat(e.target.value);
                  setLps((prev) => ({
                    ...prev,
                    monthlyCapacity: {
                      ...prev.monthlyCapacity,
                      totalLimit: total,
                      available: total - prev.monthlyCapacity.utilized,
                    },
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-Refresh Day
              </label>
              <div className="flex gap-4 items-center">
                <select
                  value={lps.monthlyCapacity.refreshDay}
                  onChange={(e) =>
                    updateLps(
                      "monthlyCapacity",
                      "refreshDay",
                      parseInt(e.target.value),
                    )
                  }
                  className="flex-1 px-3 py-2 border rounded-lg"
                  disabled={!lps.monthlyCapacity.autoRefresh}
                >
                  {[1, 5, 10, 15, 20, 25].map((day) => (
                    <option key={day} value={day}>
                      Day {day} of month
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lps.monthlyCapacity.autoRefresh}
                    onChange={(e) =>
                      updateLps(
                        "monthlyCapacity",
                        "autoRefresh",
                        e.target.checked,
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Auto Refresh</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LpsManagementPage;
