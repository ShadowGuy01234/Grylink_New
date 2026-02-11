const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    subContractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubContractor', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },

    billNumber: { type: String, trim: true },
    amount: { type: Number },
    description: { type: String, trim: true },

    // File details (Cloudinary)
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },

    // Upload mode
    uploadMode: {
      type: String,
      enum: ['image', 'excel'],
      default: 'image',
    },

    status: {
      type: String,
      enum: ['UPLOADED', 'VERIFIED', 'REJECTED'],
      default: 'UPLOADED',
    },

    // Verification
    verificationNotes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },

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

module.exports = mongoose.model('Bill', billSchema);
