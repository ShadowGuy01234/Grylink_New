const mongoose = require('mongoose');

const subContractorSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    contactName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    vendorId: { type: String, trim: true },
    gstin: { type: String, trim: true },

    status: {
      type: String,
      enum: ['LEAD_CREATED', 'PROFILE_INCOMPLETE', 'PROFILE_COMPLETED'],
      default: 'LEAD_CREATED',
    },

    // Linked EPC company
    linkedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    salesAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Selected EPC during profile completion
    selectedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubContractor', subContractorSchema);
