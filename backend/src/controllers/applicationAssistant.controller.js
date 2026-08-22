const assistantService = require('../services/applicationAssistant.service');

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
 * POST /api/application-assistant/analyze/:opportunityId
 */
const analyzeOpportunityReadiness = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const data = await assistantService.analyzeOpportunityReadiness(userId, opportunityId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/application-assistant/:opportunityId
 */
const getAssistantByOpportunity = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    if (opportunityId === 'history') {
      return getAssetHistory(req, res, next);
    }

    const data = await assistantService.getAssistantByOpportunity(userId, opportunityId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/application-assistant/:opportunityId/cover-letter
 */
const generateCoverLetter = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;
    const { tone, length } = req.body || {};

    const coverLetter = await assistantService.generateCoverLetter(userId, opportunityId, tone, length);

    res.status(200).json({
      success: true,
      coverLetter
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/application-assistant/:opportunityId/answers
 */
const generateApplicationAnswers = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;
    const { questions } = req.body || {};

    const applicationAnswers = await assistantService.generateApplicationAnswers(userId, opportunityId, questions);

    res.status(200).json({
      success: true,
      applicationAnswers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/application-assistant/:opportunityId/strategy
 */
const generateApplicationStrategy = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const applicationStrategy = await assistantService.generateApplicationStrategy(userId, opportunityId);

    res.status(200).json({
      success: true,
      applicationStrategy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/application-assistant/:opportunityId/checklist
 */
const updateChecklist = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;
    const { checklist } = req.body || {};

    const updatedChecklist = await assistantService.updateChecklist(userId, opportunityId, checklist);

    res.status(200).json({
      success: true,
      checklist: updatedChecklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/application-assistant/:opportunityId
 */
const deleteAssistant = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const result = await assistantService.deleteAssistant(userId, opportunityId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/application-assistant/history
 */
const getAssetHistory = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const history = await assistantService.getAssetHistory(userId);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeOpportunityReadiness,
  getAssistantByOpportunity,
  generateCoverLetter,
  generateApplicationAnswers,
  generateApplicationStrategy,
  updateChecklist,
  deleteAssistant,
  getAssetHistory
};
