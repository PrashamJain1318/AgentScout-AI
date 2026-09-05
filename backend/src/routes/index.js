const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const opportunityRoutes = require('./opportunity.routes');
const scraperRoutes = require('./scraper.routes');
const matchingRoutes = require('./matching.routes');
const applicationRoutes = require('./application.routes');
const analyticsRoutes = require('./analytics.routes');
const careerCopilotRoutes = require('./careerCopilot.routes');
const copilotRoutes = require('./copilot.routes');
const notificationRoutes = require('./notification.routes');
const settingsRoutes = require('./settings.routes');
const resumeRoutes = require('./resume.routes');
const applicationAssistantRoutes = require('./applicationAssistant.routes');
const interviewRoutes = require('./interview.routes');
const careerPlannerRoutes = require('./careerPlanner.routes');
const opportunityMonitorRoutes = require('./opportunityMonitor.routes');
const careerOSRoutes = require('./careerOS.routes');
const careerAgentRoutes = require('./careerAgent.routes');
const applicationAgentRoutes = require('./applicationAgent.routes');

const router = express.Router();

// Mount system routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/scraper', scraperRoutes);
router.use('/matches', matchingRoutes);
router.use('/applications', applicationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/career-copilot', careerCopilotRoutes);
router.use('/copilot', copilotRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/resume', resumeRoutes);
router.use('/application-assistant', applicationAssistantRoutes);
router.use('/interviews', interviewRoutes);
router.use('/career-planner', careerPlannerRoutes);
router.use('/opportunity-monitor', opportunityMonitorRoutes);
router.use('/career-os', careerOSRoutes);
router.use('/career-agent', careerAgentRoutes);
router.use('/application-agent', applicationAgentRoutes);

module.exports = router;
