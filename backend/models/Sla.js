const mongoose = require('mongoose');

// SLA Tracking model (SOP Phase 5 - EPC validation timeline)
const slaSchema = new mongoose.Schema(
  {
    // Reference to tracked entity
    entityType: {
      type: String,
      enum: ['EPC_VALIDATION', 'BILL_VERIFICATION', 'KYC_COMPLETION', 'NBFC_RESPONSE', 'DOCUMENT_UPLOAD'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityRef: { type: String }, // Model name for population

    // Related entities
    subContractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubContractor' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },

    // SLA timeline (days from creation)
    createdAt: { type: Date, default: Date.now },
    
    // Milestones based on SOP (Day 0, 3, 7, 10-14)
    reminders: [
      {
        day: Number, // Day 3, 7, etc.
        sentAt: Date,
        type: { type: String, enum: ['email', 'system', 'escalation'] },
        recipient: String,
      },
    ],

    // SLA deadlines
    firstReminderDue: { type: Date }, // Day 3
    secondReminderDue: { type: Date }, // Day 7
    escalationDue: { type: Date }, // Day 10
    dormantDue: { type: Date }, // Day 14

    // Current status
    status: {
      type: String,
      enum: ['ACTIVE', 'REMINDER_1_SENT', 'REMINDER_2_SENT', 'ESCALATED', 'DORMANT', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
    },

    // Completion
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Escalation details
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    escalatedAt: { type: Date },
    escalationNotes: { type: String },

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

// Auto-set milestone dates on creation
slaSchema.pre('save', function (next) {
  if (this.isNew) {
    const now = new Date();
    this.firstReminderDue = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Day 3
    this.secondReminderDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Day 7
    this.escalationDue = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Day 10
    this.dormantDue = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // Day 14
  }
  next();
});

// Index for SLA monitoring jobs
slaSchema.index({ status: 1, firstReminderDue: 1 });
slaSchema.index({ status: 1, dormantDue: 1 });

module.exports = mongoose.model('Sla', slaSchema);
