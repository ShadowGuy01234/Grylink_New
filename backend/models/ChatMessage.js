const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    cwcRfId: { type: mongoose.Schema.Types.ObjectId, ref: 'CwcRf', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['ops', 'subcontractor'], required: true },

    messageType: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },

    content: { type: String },

    // File attachment (Cloudinary)
    fileUrl: { type: String },
    cloudinaryPublicId: { type: String },
    fileName: { type: String },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
