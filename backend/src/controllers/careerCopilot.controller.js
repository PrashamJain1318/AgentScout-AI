const copilotService = require('../services/copilot.service');

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
 * Conversational AI Chat Endpoint.
 * @route POST /api/copilot/chat
 * @access Private
 */
const postCopilotChat = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const { message, prompt } = req.body || {};
    const inputMessage = message || prompt || '';

    if (!inputMessage || typeof inputMessage !== 'string' || !inputMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    if (inputMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum character length of 2000'
      });
    }

    const aiResponse = await copilotService.processCopilotChat(userId, inputMessage.trim());

    res.status(200).json({
      success: true,
      response: aiResponse,
      message: aiResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Candidate Skill Gap Analysis Endpoint.
 * @route GET /api/copilot/skill-gaps
 * @access Private
 */
const getSkillGaps = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const skillGaps = await copilotService.getSkillGapAnalysis(userId);

    res.status(200).json({
      success: true,
      skillGaps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 30-Day Career Roadmap Endpoint.
 * @route POST /api/copilot/roadmap
 * @access Private
 */
const postRoadmap = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const duration = req.body && req.body.duration ? parseInt(req.body.duration, 10) : 30;
    const roadmap = await copilotService.generateRoadmap(userId, duration);

    res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Interview Preparation Endpoint.
 * @route POST /api/copilot/interview-prep
 * @access Private
 */
const postInterviewPrep = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const { opportunityId } = req.body || {};
    const interviewPrep = await copilotService.generateInterviewPrep(userId, opportunityId);

    res.status(200).json({
      success: true,
      interviewPrep
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Candidate Profile Improvement Endpoint.
 * @route GET /api/copilot/profile-improvement
 * @access Private
 */
const getProfileImprovement = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const improvement = await copilotService.getProfileImprovement(userId);

    res.status(200).json({
      success: true,
      improvement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Backward compatible career copilot plan endpoint.
 * @route GET /api/career-copilot
 * @access Private
 */
const getCareerCopilotPlan = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const roadmap = await copilotService.generateRoadmap(userId, 30);
    const skillGaps = await copilotService.getSkillGapAnalysis(userId);

    res.status(200).json({
      success: true,
      plan: roadmap,
      skillGaps
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postCopilotChat,
  getSkillGaps,
  postRoadmap,
  postInterviewPrep,
  getProfileImprovement,
  getCareerCopilotPlan
};
