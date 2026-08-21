const User = require('../models/User.model');
const sendTokenCookie = require('../utils/sendTokenCookie');

/**
 * Register a new candidate user account.
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    let body = req.body || {};

    // 1. Fallback parse if body is raw JSON string
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    // 2. Support nested payload wrappers if provided
    if (body.user && typeof body.user === 'object') {
      body = { ...body, ...body.user };
    } else if (body.data && typeof body.data === 'object') {
      body = { ...body, ...body.data };
    }

    // 3. Extract and normalize fields
    const firstName = (body.firstName || body.first_name || req.query.firstName || '').toString().trim();
    const lastName = (body.lastName || body.last_name || req.query.lastName || '').toString().trim();
    const email = (body.email || req.query.email || '').toString().trim();
    const password = body.password ? body.password.toString() : (req.query.password ? req.query.password.toString() : '');

    // 4. Input Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, and password'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // 5. Check for Duplicate Email -> HTTP 409 Conflict
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // 6. Create User Document (Always force role: 'user')
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    // 7. Issue HTTP-only cookie and send 201 Created response
    sendTokenCookie(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user & issue session cookie.
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    let body = req.body || {};

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    if (body.user && typeof body.user === 'object') {
      body = { ...body, ...body.user };
    }

    const email = (body.email || req.query.email || '').toString().trim();
    const password = body.password ? body.password.toString() : (req.query.password ? req.query.password.toString() : '');

    // 1. Validate Input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2. Query user with explicit password selection
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Verify password hash using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Issue HTTP-only cookie and send 200 OK response
    sendTokenCookie(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user session by clearing HTTP-only cookie.
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile.
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
