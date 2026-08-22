const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification requires a valid user reference'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: [
          'new_match',
          'excellent_match',
          'application_created',
          'application_status',
          'interview',
          'offer',
          'skill_gap',
          'copilot',
          'profile',
          'system'
        ],
        message: 'Invalid notification type'
      },
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      default: '',
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user notifications sorted by creation date
NotificationSchema.index({ user: 1, createdAt: -1 });

// Compound index for counting unread notifications efficiently
NotificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
