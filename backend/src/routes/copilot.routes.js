const express = require('express');
const {
  postCopilotChat,
  getSkillGaps,
  postRoadmap,
  postInterviewPrep,
  getProfileImprovement
} = require('../controllers/careerCopilot.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Conversational AI Chat Endpoint
router.post('/chat', protect, postCopilotChat);

// Candidate Skill Gap Analysis
router.get('/skill-gaps', protect, getSkillGaps);

// 30-Day Career Learning Roadmap
router.post('/roadmap', protect, postRoadmap);

// Interview Preparation Guide
router.post('/interview-prep', protect, postInterviewPrep);

// Profile Improvement Recommendations
router.get('/profile-improvement', protect, getProfileImprovement);

module.exports = router;
