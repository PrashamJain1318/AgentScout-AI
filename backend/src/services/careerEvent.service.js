const crypto = require('crypto');
const CareerEvent = require('../models/CareerEvent.model');

/**
 * Generate a deterministic event hash to enforce deduplication
 */
const generateEventHash = (userId, eventType, relatedEntityId, title, daySignature) => {
  const dateStr = daySignature || new Date().toISOString().split('T')[0];
  const entityStr = relatedEntityId ? String(relatedEntityId) : '';
  const titleStr = title ? String(title).toLowerCase().trim() : '';
  const rawKey = `${userId}_${eventType}_${entityStr}_${titleStr}_${dateStr}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
};

/**
 * Create a new Career Event with deterministic deduplication
 */
const createCareerEvent = async (eventData) => {
  const {
    userId,
    eventType,
    title,
    description,
    category = 'CAREER_ACTION',
    priority = 'MEDIUM',
    impact = 'MEDIUM',
    metadata = {},
    sourceModule = 'SYSTEM',
    relatedEntityId = null,
    relatedEntityType = '',
    occurredAt = new Date()
  } = eventData;

  if (!userId || !eventType || !title) {
    throw new Error('UserId, eventType, and title are required to create a Career Event.');
  }

  const daySignature = metadata.daySignature || new Date(occurredAt).toISOString().split('T')[0];
  const eventHash = generateEventHash(userId, eventType, relatedEntityId, title, daySignature);

  try {
    const existingEvent = await CareerEvent.findOne({ user: userId, eventHash });
    if (existingEvent) {
      return { event: existingEvent, created: false };
    }

    const event = await CareerEvent.create({
      user: userId,
      eventType,
      category,
      title,
      description,
      priority,
      impact,
      metadata,
      sourceModule,
      relatedEntityId,
      relatedEntityType,
      eventHash,
      occurredAt
    });

    return { event, created: true };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error gracefully handled
      const existing = await CareerEvent.findOne({ user: userId, eventHash });
      return { event: existing, created: false };
    }
    console.error('Error creating Career Event:', error);
    throw error;
  }
};

/**
 * Fetch candidate timeline events with optional pagination and filters
 */
const getCareerEvents = async (userId, options = {}) => {
  const {
    limit = 20,
    page = 1,
    category,
    priority,
    unreadOnly = false,
    includeArchived = false
  } = options;

  const query = { user: userId };

  if (!includeArchived) {
    query.isArchived = false;
  }

  if (unreadOnly) {
    query.isRead = false;
  }

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [events, total, unreadCount] = await Promise.all([
    CareerEvent.find(query)
      .sort({ occurredAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    CareerEvent.countDocuments(query),
    CareerEvent.countDocuments({ user: userId, isRead: false, isArchived: false })
  ]);

  return {
    events,
    total,
    unreadCount,
    page: parsedPage,
    pages: Math.ceil(total / parsedLimit) || 1
  };
};

/**
 * Mark a specific event as read
 */
const markEventAsRead = async (userId, eventId) => {
  const event = await CareerEvent.findOneAndUpdate(
    { _id: eventId, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!event) {
    throw new Error('Career Event not found or unauthorized.');
  }

  return event;
};

/**
 * Archive a specific event
 */
const archiveEvent = async (userId, eventId) => {
  const event = await CareerEvent.findOneAndUpdate(
    { _id: eventId, user: userId },
    { $set: { isArchived: true } },
    { new: true }
  );

  if (!event) {
    throw new Error('Career Event not found or unauthorized.');
  }

  return event;
};

/**
 * Automatically inspect unified candidate context and trigger milestone events
 */
const detectImportantChanges = async (userId, unifiedContext = {}) => {
  const eventsCreated = [];

  const {
    user = {},
    resume = {},
    applications = [],
    matches = [],
    interviewSessions = []
  } = unifiedContext;

  const profile = user.profile || {};

  // 1. Profile Completion Check
  if (profile.headline && Array.isArray(profile.skills) && profile.skills.length >= 3) {
    const res = await createCareerEvent({
      userId,
      eventType: 'PROFILE_COMPLETED',
      category: 'PROFILE',
      title: 'Profile Setup Completed',
      description: 'Candidate headline, key skills, and experience details are populated.',
      priority: 'MEDIUM',
      impact: 'MEDIUM',
      sourceModule: 'PROFILE'
    });
    if (res.created) eventsCreated.push(res.event);
  }

  // 2. Resume ATS Score Event
  const atsScore = resume.atsScore ?? resume.score ?? 0;
  if (atsScore > 0) {
    const priority = atsScore >= 80 ? 'HIGH' : atsScore >= 65 ? 'MEDIUM' : 'CRITICAL';
    const res = await createCareerEvent({
      userId,
      eventType: 'RESUME_ANALYZED',
      category: 'RESUME',
      title: `Resume ATS Score: ${atsScore}/100`,
      description: `Resume analysis complete with an ATS readiness score of ${atsScore}%.`,
      priority,
      impact: atsScore >= 75 ? 'HIGH' : 'MEDIUM',
      metadata: { atsScore },
      sourceModule: 'RESUME'
    });
    if (res.created) eventsCreated.push(res.event);
  }

  // 3. High Match Discovery Events
  const rawMatches = Array.isArray(matches) ? matches : (unifiedContext.rawMatches || []);
  rawMatches.forEach(async (m) => {
    const score = m.matchScore || m.score || 0;
    if (score >= 85) {
      const isExcellent = score >= 90;
      const res = await createCareerEvent({
        userId,
        eventType: isExcellent ? 'EXCELLENT_MATCH_FOUND' : 'HIGH_MATCH_FOUND',
        category: 'OPPORTUNITY',
        title: `${score}% Match: ${m.opportunity?.title || 'Target Role'}`,
        description: `Found high alignment job match at ${m.opportunity?.company || 'Target Company'}.`,
        priority: isExcellent ? 'CRITICAL' : 'HIGH',
        impact: 'HIGH',
        relatedEntityId: m.opportunity?._id || m._id,
        relatedEntityType: 'Opportunity',
        sourceModule: 'OPPORTUNITIES'
      });
      if (res.created) eventsCreated.push(res.event);
    }
  });

  // 4. Application Events
  const rawApps = Array.isArray(applications) ? applications : (unifiedContext.rawApplications || []);
  if (rawApps.length > 0) {
    const recentApp = rawApps[0];
    const res = await createCareerEvent({
      userId,
      eventType: 'APPLICATION_SUBMITTED',
      category: 'APPLICATION',
      title: `Applied to ${recentApp.position || recentApp.company || 'Job Opportunity'}`,
      description: `Application logged for ${recentApp.position} at ${recentApp.company}.`,
      priority: 'HIGH',
      impact: 'HIGH',
      relatedEntityId: recentApp._id,
      relatedEntityType: 'Application',
      sourceModule: 'APPLICATIONS'
    });
    if (res.created) eventsCreated.push(res.event);
  }

  // 5. Mock Interview Events
  const rawInterviews = Array.isArray(interviewSessions) ? interviewSessions : (unifiedContext.rawInterviewSessions || []);
  const completedMocks = rawInterviews.filter(s => s.status === 'completed');
  if (completedMocks.length > 0) {
    const latestMock = completedMocks[0];
    const res = await createCareerEvent({
      userId,
      eventType: 'INTERVIEW_COMPLETED',
      category: 'INTERVIEW',
      title: `Mock Interview Completed: ${latestMock.role || 'Practice Session'}`,
      description: `Scored ${latestMock.overallScore || 75}% in AI interview coach simulation.`,
      priority: 'HIGH',
      impact: 'HIGH',
      relatedEntityId: latestMock._id,
      relatedEntityType: 'InterviewSession',
      sourceModule: 'INTERVIEW_COACH'
    });
    if (res.created) eventsCreated.push(res.event);
  }

  return eventsCreated;
};

module.exports = {
  createCareerEvent,
  getCareerEvents,
  markEventAsRead,
  archiveEvent,
  detectImportantChanges,
  generateEventHash
};
