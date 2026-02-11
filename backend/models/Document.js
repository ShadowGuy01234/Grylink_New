const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    documentType: {
      type: String,
      enum: [
        'CIN',
        'GST',
        'PAN',
        'BOARD_RESOLUTION',
        'BANK_STATEMENTS',
        'AUDITED_FINANCIALS',
        'PROJECT_DETAILS',
        'CASHFLOW_DETAILS',
        'OTHER',
      ],
      required: true,
    },

    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // Cloudinary URL
    cloudinaryPublicId: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },

    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    verificationNotes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
