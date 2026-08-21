const User = require('../models/User.model');
const sendTokenCookie = require('../utils/sendTokenCookie');

/**
 * Register a new candidate user account.
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    console.log("=== REGISTER DEBUG ===");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body type:", typeof req.body);
    console.log("Body fields:", Object.keys(req.body || {}));

    let body = req.body || {};

    // 1. Convert buffer or string to object if needed
    if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf-8'));
      } catch (e) {
        body = {};
      }
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    // 2. Handle nested payload wrappers
    if (body.user && typeof body.user === 'object') {
      body = { ...body, ...body.user };
    } else if (body.data && typeof body.data === 'object') {
      body = { ...body, ...body.data };
    } else if (body.payload && typeof body.payload === 'object') {
      body = { ...body, ...body.payload };
    }

    // 3. Extract parameters with alias & case fallbacks
    let firstName = (
      body.firstName ||
      body.first_name ||
      body.firstname ||
      body.FirstName ||
      req.query.firstName ||
      req.query.first_name ||
      ''
    ).toString().trim();

    let lastName = (
      body.lastName ||
      body.last_name ||
      body.lastname ||
      body.LastName ||
      req.query.lastName ||
      req.query.last_name ||
      ''
    ).toString().trim();

    // Fallback: Extract from single `name` or `fullName` if firstName/lastName not explicitly provided
    const fullName = (body.name || body.fullName || body.full_name || req.query.name || '').toString().trim();
    if (fullName && (!firstName || !lastName)) {
      const parts = fullName.split(/\s+/);
      if (!firstName) firstName = parts[0] || '';
      if (!lastName) lastName = parts.slice(1).join(' ') || parts[0] || '';
    }

    // Secondary fallback: Sync single component names
    if (firstName && !lastName) {
      lastName = firstName;
    } else if (lastName && !firstName) {
      firstName = lastName;
    }

    const email = (
      body.email ||
      body.emailAddress ||
      body.email_address ||
      body.username ||
      req.query.email ||
      ''
    ).toString().trim();

    const password = (
      body.password ||
      body.pass ||
      req.query.password ||
      ''
    ).toString();

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

    if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf-8'));
      } catch (e) {
        body = {};
      }
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    if (body.user && typeof body.user === 'object') {
      body = { ...body, ...body.user };
    }

    const email = (
      body.email ||
      body.emailAddress ||
      body.email_address ||
      body.username ||
      req.query.email ||
      ''
    ).toString().trim();

    const password = (
      body.password ||
      body.pass ||
      req.query.password ||
      ''
    ).toString();

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
