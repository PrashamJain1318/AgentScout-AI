/**
 * Normalization service to convert raw scraped Bright Data records
 * into the standardized Opportunity Mongoose Schema structure.
 */

/**
 * Classify role type into 'job', 'internship', or 'research'.
 * @param {string} title
 * @param {string} description
 * @param {string} rawType
 * @returns {string} 'job' | 'internship' | 'research'
 */
const classifyRoleType = (title = '', description = '', rawType = '') => {
  const combined = `${title} ${description} ${rawType}`.toLowerCase();
  
  if (/intern|trainee|apprentice/i.test(combined)) {
    return 'internship';
  }
  if (/research|fellow|phd|postdoc|scientist/i.test(combined)) {
    return 'research';
  }
  return 'job';
};

/**
 * Determine if role is remote based on text signals.
 * @param {string} location
 * @param {string} title
 * @param {string} description
 * @param {boolean} rawRemote
 * @returns {boolean}
 */
const isRemoteRole = (location = '', title = '', description = '', rawRemote) => {
  if (typeof rawRemote === 'boolean') return rawRemote;
  const combined = `${location} ${title} ${description}`.toLowerCase();
  return /remote|work from home|anywhere|telecommute/i.test(combined);
};

/**
 * Normalize a single raw Bright Data scraped record.
 * @param {Object} raw - Raw record from Bright Data API
 * @returns {Object|null} Normalized opportunity object or null if invalid
 */
const normalizeOpportunity = (raw = {}) => {
  if (!raw || typeof raw !== 'object') return null;

  const title = (raw.job_title || raw.title || raw.role || raw.position || '').toString().trim();
  const company = (raw.company_name || raw.company || raw.organization || raw.employer || '').toString().trim();

  // Title and Company are mandatory for valid opportunity records
  if (!title || !company) {
    return null;
  }

  const rawLocation = (raw.job_location || raw.location || raw.city || 'Remote').toString().trim();
  const description = (raw.job_description || raw.description || raw.summary || `${title} position at ${company}`).toString().trim();
  const rawType = (raw.job_type || raw.type || '').toString().trim();
  const type = classifyRoleType(title, description, rawType);
  const remote = isRemoteRole(rawLocation, title, description, raw.is_remote || raw.remote);

  let requirements = [];
  if (Array.isArray(raw.requirements)) {
    requirements = raw.requirements.map(r => String(r).trim()).filter(Boolean);
  } else if (Array.isArray(raw.skills)) {
    requirements = raw.skills.map(s => String(s).trim()).filter(Boolean);
  } else if (typeof raw.requirements === 'string') {
    requirements = raw.requirements.split(',').map(s => s.trim()).filter(Boolean);
  }

  const salary = (raw.salary || raw.compensation || raw.pay || 'Not disclosed').toString().trim();
  const applicationUrl = (raw.job_url || raw.apply_url || raw.source_url || raw.url || '').toString().trim();
  const sourceUrl = (raw.source_url || raw.job_url || raw.url || '').toString().trim();
  const brightDataJobId = (raw.job_id || raw.id || raw.brightdata_id || raw.dataset_item_id || '').toString().trim();

  let postedAt = new Date();
  if (raw.date_posted || raw.posted_at || raw.scraped_at) {
    const parsedDate = new Date(raw.date_posted || raw.posted_at || raw.scraped_at);
    if (!isNaN(parsedDate.getTime())) {
      postedAt = parsedDate;
    }
  }

  return {
    title,
    company,
    location: rawLocation || 'Remote',
    type,
    remote,
    description,
    requirements,
    salary: salary || 'Not disclosed',
    applicationUrl,
    source: 'Bright Data',
    sourceUrl,
    brightDataJobId,
    isActive: true,
    postedAt
  };
};

/**
 * Normalize an array of raw Bright Data scraped records.
 * @param {Array} rawRecords
 * @returns {Array} List of valid normalized opportunity records
 */
const normalizeOpportunityList = (rawRecords = []) => {
  if (!Array.isArray(rawRecords)) return [];
  return rawRecords
    .map(normalizeOpportunity)
    .filter(record => record !== null);
};

module.exports = {
  normalizeOpportunity,
  normalizeOpportunityList
};
