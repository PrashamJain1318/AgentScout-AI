const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: function() {
        // Password is required only if no social account is attached
        const sa = this.socialAccounts || {};
        const hasSocial = Boolean(sa.google?.id || sa.github?.id || sa.linkedin?.id);
        return !hasSocial;
      },
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: ''
    },
    authProviders: {
      type: [String],
      enum: ['email', 'google', 'github', 'linkedin'],
      default: ['email']
    },
    socialAccounts: {
      google: {
        id: { type: String, default: null },
        email: { type: String, default: null },
        picture: { type: String, default: null }
      },
      github: {
        id: { type: String, default: null },
        username: { type: String, default: null },
        email: { type: String, default: null },
        avatar: { type: String, default: null }
      },
      linkedin: {
        id: { type: String, default: null },
        email: { type: String, default: null },
        picture: { type: String, default: null }
      }
    },
    profile: {
      headline: { type: String, default: '' },
      bio: { type: String, default: '' },
      biography: { type: String, default: '' },
      skills: { type: [String], default: [] },
      location: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      experience: { type: [Object], default: [] },
      education: { type: [Object], default: [] },
      preferences: {
        desiredRoles: { type: [String], default: [] },
        preferredLocations: { type: [String], default: [] },
        jobTypes: { type: [String], default: ['Full-time'] },
        workModes: { type: [String], default: ['Remote', 'Hybrid'] },
        minimumSalary: { type: Number, default: 0 },
        experienceLevel: { type: String, default: 'Mid Level' },
        remotePreference: { type: Boolean, default: true }
      },
      notificationPreferences: {
        newMatches: { type: Boolean, default: true },
        excellentMatches: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        interviewAlerts: { type: Boolean, default: true },
        offerAlerts: { type: Boolean, default: true },
        careerCopilot: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: false }
      },
      privacyPreferences: {
        profileVisibility: { type: String, enum: ['public', 'recruiters', 'private'], default: 'recruiters' },
        recruiterDiscovery: { type: Boolean, default: true },
        aiPersonalization: { type: Boolean, default: true }
      }
    }
  },
  {
    timestamps: true
  }
);

// Sparse unique indexes for social account provider IDs
UserSchema.index({ 'socialAccounts.google.id': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'socialAccounts.github.id': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'socialAccounts.linkedin.id': 1 }, { unique: true, sparse: true });

// Hash password prior to saving
UserSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password during authentication
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
