const User = require('../models/User.model');

/**
 * Get current authenticated user profile.
 * @route GET /api/users/profile
 * @access Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile.
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const body = req.body || {};

    // Reject arbitrary MongoDB update operators ($set, $unset, etc.)
    const keys = Object.keys(body);
    const hasMongoOperators = keys.some((key) => key.startsWith('$'));
    if (hasMongoOperators) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile data'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 1. Update safe top-level fields
    if (body.firstName !== undefined) {
      if (typeof body.firstName !== 'string' || !body.firstName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile data'
        });
      }
      user.firstName = body.firstName.trim();
    }

    if (body.lastName !== undefined) {
      if (typeof body.lastName !== 'string' || !body.lastName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile data'
        });
      }
      user.lastName = body.lastName.trim();
    }

    // 2. Update profile sub-document fields safely
    if (body.profile && typeof body.profile === 'object' && !Array.isArray(body.profile)) {
      const p = body.profile;

      if (p.headline !== undefined && typeof p.headline === 'string') {
        user.profile.headline = p.headline.trim();
      }

      if (p.bio !== undefined && typeof p.bio === 'string') {
        user.profile.bio = p.bio.trim();
        user.profile.biography = p.bio.trim();
      } else if (p.biography !== undefined && typeof p.biography === 'string') {
        user.profile.biography = p.biography.trim();
        user.profile.bio = p.biography.trim();
      }

      if (p.location !== undefined && typeof p.location === 'string') {
        user.profile.location = p.location.trim();
      }

      if (p.github !== undefined && typeof p.github === 'string') {
        user.profile.github = p.github.trim();
      }

      if (p.linkedin !== undefined && typeof p.linkedin === 'string') {
        user.profile.linkedin = p.linkedin.trim();
      }

      if (p.skills !== undefined && Array.isArray(p.skills)) {
        user.profile.skills = p.skills.filter((s) => typeof s === 'string').map((s) => s.trim());
      }

      if (p.experience !== undefined && Array.isArray(p.experience)) {
        user.profile.experience = p.experience;
      }

      if (p.education !== undefined && Array.isArray(p.education)) {
        user.profile.education = p.education;
      }

      if (p.preferences !== undefined && typeof p.preferences === 'object') {
        if (p.preferences.desiredRoles && Array.isArray(p.preferences.desiredRoles)) {
          user.profile.preferences.desiredRoles = p.preferences.desiredRoles;
        }
        if (p.preferences.preferredLocations && Array.isArray(p.preferences.preferredLocations)) {
          user.profile.preferences.preferredLocations = p.preferences.preferredLocations;
        }
        if (typeof p.preferences.remotePreference === 'boolean') {
          user.profile.preferences.remotePreference = p.preferences.remotePreference;
        }
      }
    }

    // Save updated user document
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
