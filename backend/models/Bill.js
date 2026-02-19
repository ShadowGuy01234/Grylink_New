const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    subContractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubContractor', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },

    // Bill Type per SOP - RA Bills with WCC/Measurement sheets
    billType: {
      type: String,
      enum: ['REGULAR', 'RA_BILL', 'FINAL'],
      default: 'REGULAR',
    },
    raBillNumber: { type: Number }, // Sequential RA bill number

    billNumber: { type: String, trim: true },
    amount: { type: Number },
    description: { type: String, trim: true },

    // File details (Cloudinary)
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },

    // WCC (Work Completion Certificate) per SOP
    wcc: {
      uploaded: { type: Boolean, default: false },
      fileName: String,
      fileUrl: String,
      cloudinaryPublicId: String,
      uploadedAt: Date,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
    },

    // Measurement Sheet per SOP
    measurementSheet: {
      uploaded: { type: Boolean, default: false },
      fileName: String,
      fileUrl: String,
      cloudinaryPublicId: String,
      uploadedAt: Date,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      certified: { type: Boolean, default: false },
      certifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      certifiedAt: Date,
    },

    // Joint Measurement Details per SOP
    jointMeasurement: {
      conducted: { type: Boolean, default: false },
      date: Date,
      epcRepresentative: String,
      scRepresentative: String,
      gryorkWitness: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      remarks: String,
    },

    // Upload mode
    uploadMode: {
      type: String,
      enum: ['image', 'excel'],
      default: 'image',
    },

    status: {
      type: String,
      enum: ['UPLOADED', 'PENDING_WCC', 'PENDING_MEASUREMENT', 'UNDER_REVIEW', 'OPS_APPROVED', 'EPC_VERIFIED', 'EPC_REJECTED', 'VERIFIED', 'REJECTED', 'SUBMITTED_TO_NBFC'],
      default: 'UPLOADED',
    },

    // Verification
    verificationNotes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },

    // NBFC submission tracking
    nbfcSubmission: {
      submitted: { type: Boolean, default: false },
      submittedAt: Date,
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      nbfcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nbfc' },
      acknowledgementRef: String,
    },

    // Ops notes for internal tracking
    notes: [
      {
        text: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],

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

// Check if bill is ready for NBFC submission
billSchema.methods.isReadyForSubmission = function() {
  return (
    this.status === 'VERIFIED' &&
    this.wcc.uploaded &&
    this.wcc.verified &&
    this.measurementSheet.uploaded &&
    this.measurementSheet.certified
  );
};

module.exports = mongoose.model('Bill', billSchema);
