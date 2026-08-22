const resumeService = require('../services/resume.service');

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
 * GET /api/resume
 */
const getResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const resume = await resumeService.getResumeByUser(userId);

    res.status(200).json({
      success: true,
      resume: resume || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resume/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX)'
      });
    }

    const userId = req.user.id || req.user._id;
    const file = req.file;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'File size exceeds maximum 10MB limit'
      });
    }

    const resume = await resumeService.uploadResume(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size
    );

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resume/analyze
 */
const analyzeResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const resume = await resumeService.analyzeResume(userId);

    res.status(200).json({
      success: true,
      message: 'Resume analysis updated successfully',
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resume/analysis
 */
const getResumeAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const resume = await resumeService.getResumeByUser(userId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume uploaded'
      });
    }

    res.status(200).json({
      success: true,
      analysis: {
        scores: resume.scores,
        extractedData: resume.extractedData,
        gaps: resume.gaps,
        suggestions: resume.suggestions,
        analyzedAt: resume.analyzedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resume/reanalyze
 */
const reanalyzeResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const resume = await resumeService.analyzeResume(userId);

    res.status(200).json({
      success: true,
      message: 'Resume reanalyzed successfully',
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resume
 */
const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await resumeService.deleteResume(userId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resume/download
 */
const downloadResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { fileBuffer, mimeType, originalName } = await resumeService.getFileForDownload(userId);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resume/match/:opportunityId
 */
const matchResumeToOpportunity = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.params);
    const userId = req.user.id || req.user._id;
    const { opportunityId } = req.params;

    const analysis = await resumeService.matchResumeToOpportunity(userId, opportunityId);

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/resume/portfolio
 */
const updatePortfolio = async (req, res, next) => {
  try {
    checkNoMongoOperators(req.body);
    const userId = req.user.id || req.user._id;

    const resume = await resumeService.updatePortfolio(userId, req.body || {});

    res.status(200).json({
      success: true,
      message: 'Portfolio intelligence updated successfully',
      portfolio: resume.portfolio
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResume,
  uploadResume,
  analyzeResume,
  getResumeAnalysis,
  reanalyzeResume,
  deleteResume,
  downloadResume,
  matchResumeToOpportunity,
  updatePortfolio
};
