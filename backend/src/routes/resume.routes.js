const express = require('express');
const multer = require('multer');
const {
  getResume,
  uploadResume,
  analyzeResume,
  getResumeAnalysis,
  reanalyzeResume,
  deleteResume,
  downloadResume,
  matchResumeToOpportunity,
  updatePortfolio
} = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', protect, getResume);
router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze', protect, analyzeResume);
router.get('/analysis', protect, getResumeAnalysis);
router.post('/reanalyze', protect, reanalyzeResume);
router.delete('/', protect, deleteResume);
router.get('/download', protect, downloadResume);
router.post('/match/:opportunityId', protect, matchResumeToOpportunity);
router.put('/portfolio', protect, updatePortfolio);

module.exports = router;
