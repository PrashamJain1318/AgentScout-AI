const interviewService = require('../services/interview.service');

const checkNoMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      const err = new Error(`Invalid request parameter: Mongo operators (${key}) are forbidden`);
      err.statusCode = 400;
      throw err;
    }
  }
};

/**
 * POST /api/interviews/start
 */
const startInterview = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const data = await interviewService.startInterview(userId, req.body || {});

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/interviews/:sessionId/answer
 */
const submitAnswer = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;
    const { sessionId } = req.params;
    const { answer } = req.body || {};

    const data = await interviewService.submitAnswer(userId, sessionId, answer || '');

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/interviews/:sessionId/complete
 */
const completeInterview = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { sessionId } = req.params;

    const data = await interviewService.completeInterview(userId, sessionId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interviews/history
 */
const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const history = await interviewService.getInterviewHistory(userId);

    res.status(200).json({
      success: true,
      history: history || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interviews/readiness/:opportunityId?
 */
const getInterviewReadiness = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const data = await interviewService.getInterviewReadiness(userId, opportunityId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interviews/:sessionId
 */
const getInterviewSession = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { sessionId } = req.params;

    if (sessionId === 'history') {
      return getInterviewHistory(req, res, next);
    }
    if (sessionId === 'readiness') {
      return getInterviewReadiness(req, res, next);
    }

    const data = await interviewService.getInterviewSession(userId, sessionId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/interviews/:sessionId
 */
const deleteInterviewSession = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { sessionId } = req.params;

    const result = await interviewService.deleteInterviewSession(userId, sessionId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewReadiness,
  getInterviewSession,
  deleteInterviewSession
};
