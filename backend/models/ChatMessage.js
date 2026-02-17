const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    cwcRfId: { type: mongoose.Schema.Types.ObjectId, ref: 'CwcRf', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['ops', 'subcontractor', 'admin', 'nbfc'], required: true },

    messageType: {
      type: String,
      enum: ['text', 'file', 'system', 'action_required'],
      default: 'text',
    },

    content: { type: String },

    // File attachment (Cloudinary)
    fileUrl: { type: String },
    cloudinaryPublicId: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    fileType: { type: String }, // MIME type
    
    // Thumbnail for images/PDFs
    thumbnailUrl: { type: String },

    // Reply to another message
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },

    // Message status
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Reactions
    reactions: [{
      emoji: { type: String, enum: ['👍', '✅', '❌', '⏳', '📄', '❓'] },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    }],

    // For action_required messages
    actionType: { 
      type: String, 
      enum: ['REQUEST_DOCUMENT', 'CLARIFICATION', 'APPROVAL_NEEDED', 'URGENT'],
    },
    actionResolved: { type: Boolean, default: false },
    actionResolvedAt: { type: Date },
    actionResolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Edit tracking
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    originalContent: { type: String },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes for efficient queries
chatMessageSchema.index({ cwcRfId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ isRead: 1 });
chatMessageSchema.index({ messageType: 1 });
chatMessageSchema.index({ 'reactions.userId': 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
